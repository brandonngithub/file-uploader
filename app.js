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
    const folders = await prisma.folder.findMany();

    const files = await prisma.file.findMany({
      where: { folderId: null }, // only display files not in folders
    });

    res.render("index", {
      folders,
      files,
      error: req.query.error || null,
      success: req.query.success || null,
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

// Create new folder
app.post("/folder", async (req, res) => {
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

// View folder contents
app.get("/folder/:id", async (req, res) => {
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

// Create new file
app.post("/file", upload.single("file"), async (req, res) => {
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

// Add this with your other routes
app.delete('/file/:id', async (req, res) => {
  try {
      // First get the file to find its path
      const file = await prisma.file.findUnique({
          where: { id: req.params.id }
      });

      if (!file) {
          return res.status(404).json({ message: 'File not found' });
      }

      // Delete from database
      await prisma.file.delete({
          where: { id: req.params.id }
      });

      // Delete the actual file (optional)
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, 'public', file.path);
      
      fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
      });

      res.status(200).send();
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete file' });
  }
});

app.listen(3000, () => console.log("Listening on port 3000"));
