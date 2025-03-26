const express = require("express");
const path = require("path");
const prisma = require("./db");
const upload = require("./middlewares/upload");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// Display main drive view
app.get("/", async (req, res) => {
  try {
    const folders = await prisma.folder.findMany({
      orderBy: { name: "asc" }, // Optional: sort folders alphabetically
    });

    const files = await prisma.file.findMany({
      where: { folderId: null },
      orderBy: { name: "asc" }, // Optional: sort files alphabetically
    });

    // Helper function to format file sizes
    const formatFileSize = (bytes) => {
      if (!bytes) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    // Helper function to format dates
    const formatDate = (date) => {
      return new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    res.render("index", {
      folders,
      files,
      error: req.query.error || null,
      success: req.query.success || null,
      formatFileSize, // Make the helper available in EJS
      formatDate, // Make the date formatter available
    });
  } catch (error) {
    console.error("Error loading content:", error);
    res.render("index", {
      folders: [],
      files: [],
      error: "Failed to load content",
      success: null,
    });
  }
});

// Handle folder creation
app.post("/create-folder", async (req, res) => {
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

// Handle file upload
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.redirect("/?error=No file selected");
    }

    const fileData = {
      name: req.file.originalname,
      type: path.extname(req.file.originalname).substring(1),
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}`,
    };

    if (req.body.folderId) {
      fileData.folderId = req.body.folderId;
    }

    await prisma.file.create({
      data: fileData,
    });

    res.redirect("/?success=File uploaded successfully");
  } catch (error) {
    res.redirect(`/?error=${encodeURIComponent(error.message)}`);
  }
});

app.listen(3000, () => console.log("Listening on port 3000"));
