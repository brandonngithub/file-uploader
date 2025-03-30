const express = require("express");
const path = require("path");
const prisma = require("./db");
const upload = require("./middlewares/upload");
const session = require("express-session");
const passport = require("./middlewares/passport");
const bcrypt = require("bcrypt");
const ensureAuthenticated = require("./middlewares/auth");
const supabase = require("./middlewares/supabase");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

app.use(passport.session());

// Display home page
app.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const folders = await prisma.folder.findMany();
    const files = await prisma.file.findMany({
      where: { folderId: null }, // only display files not in folders
    });

    res.render("index", {
      folders,
      files,
      error: req.query.error || null,
      success: req.query.success || null,
      user: req.user,
    });
  } catch (error) {
    console.error("Error loading content:", error);

    res.render("index", {
      folders: [],
      files: [],
      error: "Failed to load content",
      success: null,
      user: req.user,
    });
  }
});

// Route for creating new folder
app.post("/folder", ensureAuthenticated, async (req, res) => {
  try {
    const { folderName } = req.body;

    if (!folderName) {
      return res.redirect("/?error=Folder name is required");
    }

    await prisma.folder.create({
      data: {
        name: folderName,
      },
    });

    res.redirect("/?success=Folder created successfully");
  } catch (error) {
    let errorMessage = "Failed to create folder";
    if (error.code === "P2002") {
      errorMessage = "A folder with this name already exists";
    }
    res.redirect(`/?error=${encodeURIComponent(errorMessage)}`);
  }
});

// Display folder
app.get("/folder/:id", ensureAuthenticated, async (req, res) => {
  try {
    const folder = await prisma.folder.findUnique({
      where: { id: req.params.id },
    });

    const files = await prisma.file.findMany({
      where: { folderId: req.params.id },
      orderBy: { name: "asc" },
    });

    res.render("folder", {
      folder,
      files,
      error: req.query.error || null,
      success: req.query.success || null,
      user: req.user,
      formatFileSize: (bytes) => {
        if (!bytes) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
      },
      formatDate: (date) => {
        return new Date(date).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    });
  } catch (error) {
    res.redirect("/?error=Folder not found");
  }
});

// Route for deleting a folder
app.delete("/folder/:id", ensureAuthenticated, async (req, res) => {
  const fs = require("fs");
  const path = require("path");

  try {
    // First get all files in the folder
    const files = await prisma.file.findMany({
      where: { folderId: req.params.id },
    });

    // Delete all files from storage
    const deletePromises = files.map((file) => {
      return new Promise((resolve) => {
        const filePath = path.join(__dirname, "public", file.path);
        fs.unlink(filePath, (err) => {
          if (err) console.error("Error deleting file:", err);
          resolve();
        });
      });
    });

    await Promise.all(deletePromises);

    // Delete all files from database
    await prisma.file.deleteMany({
      where: { folderId: req.params.id },
    });

    // Finally delete the folder
    await prisma.folder.delete({
      where: { id: req.params.id },
    });

    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete folder" });
  }
});

// Route for renaming a folder
app.patch(
  "/folder/:id/rename",
  ensureAuthenticated,
  express.json(),
  async (req, res) => {
    try {
      const { newName } = req.body;

      if (!newName || typeof newName !== "string") {
        return res
          .status(400)
          .json({ message: "New name is required and must be a string" });
      }

      const updatedFolder = await prisma.folder.update({
        where: { id: req.params.id },
        data: { name: newName },
      });

      res.status(200).json(updatedFolder);
    } catch (error) {
      console.error(error);

      let message = "Failed to rename folder";
      if (error.code === "P2002") {
        message = "A folder with this name already exists";
      }

      res.status(500).json({ message });
    }
  },
);

// Route for creating a new file
app.post(
  "/file",
  ensureAuthenticated,
  upload.single("file"), // Still using multer to get the file buffer
  async (req, res) => {
    try {
      if (!req.file) {
        return res.redirect("/?error=No file selected");
      }

      // Generate a unique filename
      const fileExt = path.extname(req.file.originalname);
      const fileName = `${Date.now()}${fileExt}`;
      const filePath = `uploads/${req.user.id}/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("files") // Your bucket name
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) {
        throw new Error(`Supabase upload error: ${error.message}`);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("files")
        .getPublicUrl(filePath);

      const fileData = {
        name: req.file.originalname,
        type: path.extname(req.file.originalname).substring(1),
        size: req.file.size,
        url: urlData.publicUrl,
        userId: req.user.id,
      };

      if (req.body.folderId) {
        fileData.folderId = req.body.folderId;
      }

      await prisma.file.create({
        data: fileData,
      });

      res.redirect("/?success=File uploaded successfully");
    } catch (error) {
      console.error(error);
      res.redirect(`/?error=${encodeURIComponent(error.message)}`);
    }
  },
);

// Route for deleting a file
app.delete("/file/:id", ensureAuthenticated, async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Delete from database first
    await prisma.file.delete({
      where: { id: req.params.id },
    });

    // Extract path from URL (assuming URL is like: https://[supabase-url]/storage/v1/object/public/files/path/to/file)
    const urlParts = file.url.split("/");
    const filePath = urlParts.slice(urlParts.indexOf("files") + 1).join("/");

    // Delete from Supabase Storage
    const { error } = await supabase.storage.from("files").remove([filePath]);

    if (error) {
      console.error("Error deleting file from Supabase:", error);
      // We've already deleted the DB record, so just log the error
    }

    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete file" });
  }
});

// Route for renaming a file
app.patch(
  "/file/:id/rename",
  ensureAuthenticated,
  express.json(),
  async (req, res) => {
    // Add express.json() middleware
    const fs = require("fs");
    const path = require("path");

    try {
      const { newName } = req.body;

      if (!newName || typeof newName !== "string") {
        return res
          .status(400)
          .json({ message: "New name is required and must be a string" });
      }

      // Get current file
      const file = await prisma.file.findUnique({
        where: { id: req.params.id },
      });

      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Get file extension
      const ext = path.extname(file.name);
      const newFileName = newName.endsWith(ext) ? newName : newName + ext;

      // Update database
      const updatedFile = await prisma.file.update({
        where: { id: req.params.id },
        data: { name: newFileName },
      });

      res.status(200).json(updatedFile);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to rename file" });
    }
  },
);

// Route for viewing file details
app.get("/file/:id", ensureAuthenticated, async (req, res) => {
  try {
    const file = await prisma.file.findUnique({
      where: { id: req.params.id },
    });

    if (!file) {
      return res.redirect("/?error=File not found");
    }

    res.render("file", {
      file,
      user: req.user,
      formatFileSize: (bytes) => {
        if (!bytes) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
      },
      formatDate: (date) => {
        return new Date(date).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
    });
  } catch (error) {
    console.error(error);
    res.redirect("/?error=Failed to load file details");
  }
});

// Render signup form
app.get("/auth/signup", (req, res) => {
  res.render("signup", { error: req.query.error });
});

// Render login form
app.get("/auth/login", (req, res) => {
  res.render("login", { error: req.query.error });
});

app.post(
  "/auth/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login?error=Invalid credentials",
    failureFlash: false,
  }),
);

// Log out of app
app.get("/auth/logout", ensureAuthenticated, (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.redirect("/?error=Failed to logout");
    }
    res.redirect("/auth/login");
  });
});

// Used in signup to create new user
app.post("/user", async (req, res) => {
  try {
    const { name, password } = req.body;

    // Basic validation
    if (!name || !password) {
      return res.redirect(
        "/auth/signup?error=Username and password are required",
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { name } });
    if (existingUser) {
      return res.redirect("/auth/signup?error=Username already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
      },
    });

    res.redirect("/auth/login?success=Account created successfully");
  } catch (error) {
    console.error(error);
    res.redirect("/auth/signup?error=Error creating account");
  }
});

app.listen(3000, () => console.log("Listening on port 3000"));
