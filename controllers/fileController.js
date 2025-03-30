const prisma = require("../db");
const supabase = require("../middlewares/supabase");

async function createFile(req, res) {
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
}

async function deleteFile(req, res) {
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Delete from database first
    await prisma.file.delete({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
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
}

async function renameFile(req, res) {
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
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Get file extension
    const ext = path.extname(file.name);
    const newFileName = newName.endsWith(ext) ? newName : newName + ext;

    // Update database
    const updatedFile = await prisma.file.update({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      data: { name: newFileName },
    });

    res.status(200).json(updatedFile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to rename file" });
  }
}

async function displayFile(req, res) {
  try {
    const file = await prisma.file.findUnique({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
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
}

module.exports = {
  createFile,
  deleteFile,
  renameFile,
  displayFile,
};
