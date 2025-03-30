const prisma = require("../db");

async function createFolder(req, res) {
  try {
    const { folderName } = req.body;

    if (!folderName) {
      return res.redirect("/?error=Folder name is required");
    }

    await prisma.folder.create({
      data: {
        name: folderName,
        userId: req.user.id,
      },
    });

    res.redirect("/?success=Folder created successfully");
  } catch (error) {
    let errorMessage = "Failed to create folder";
    if (error.code === "P2002") {
      errorMessage = "A folder with this name already exists for this user";
    }
    res.redirect(`/?error=${encodeURIComponent(errorMessage)}`);
  }
}

async function displayFolder(req, res) {
  try {
    const folder = await prisma.folder.findUnique({
      where: {
        id: req.params.id,
        userId: req.user.id, // Ensure the folder belongs to current user
      },
    });

    if (!folder) {
      return res.redirect("/?error=Folder not found or access denied");
    }

    const files = await prisma.file.findMany({
      where: {
        folderId: req.params.id,
        userId: req.user.id, // Only show current user's files
      },
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
}

async function deleteFolder(req, res) {
  const fs = require("fs");
  const path = require("path");

  try {
    // First get all files in the folder
    const files = await prisma.file.findMany({
      where: {
        folderId: req.params.id,
        userId: req.user.id,
      },
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
      where: {
        folderId: req.params.id,
        userId: req.user.id,
      },
    });

    // Finally delete the folder
    await prisma.folder.delete({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete folder" });
  }
}

async function renameFolder(req, res) {
  try {
    const { newName } = req.body;

    if (!newName || typeof newName !== "string") {
      return res
        .status(400)
        .json({ message: "New name is required and must be a string" });
    }

    const updatedFolder = await prisma.folder.update({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
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
}

module.exports = {
  createFolder,
  displayFolder,
  deleteFolder,
  renameFolder,
};
