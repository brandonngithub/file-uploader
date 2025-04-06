const prisma = require("../db");
const supabase = require("../middlewares/supabase");
const { formatFileSize, formatDate } = require("../middlewares/helper.js");

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
      // P2002 is a prisma error
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
        userId: req.user.id,
      },
    });

    if (!folder) {
      return res.redirect("/?error=Folder not found or access denied");
    }

    const files = await prisma.file.findMany({
      where: {
        folderId: req.params.id,
        userId: req.user.id,
      },
      orderBy: { name: "asc" },
    });

    const formattedFiles = files.map((file) => ({
      ...file,
      size: formatFileSize(file.size),
      createdAt: formatDate(file.createdAt),
    }));

    res.render("folder", {
      folder: folder,
      files: formattedFiles,
      error: req.query.error || null,
      success: req.query.success || null,
      user: req.user,
    });
  } catch (error) {
    res.redirect("/?error=Folder not found");
  }
}

async function deleteFolder(req, res) {
  try {
    const files = await prisma.file.findMany({
      where: {
        folderId: req.params.id,
        userId: req.user.id,
      },
    });

    // Delete files from Supabase storage
    const deletePromises = files.map(async (file) => {
      try {
        // Extract path from URL that looks like https://[supabase-url]/storage/v1/object/public/files/path/to/file
        const urlParts = file.url.split("/");
        const filePath = urlParts
          .slice(urlParts.indexOf("files") + 1)
          .join("/");

        const { error } = await supabase.storage
          .from("files")
          .remove([filePath]);

        if (error) {
          console.error("Error deleting file from Supabase:", error);
        }
      } catch (err) {
        console.error("Error processing file deletion:", err);
      }
    });

    await Promise.all(deletePromises);

    // Delete files from database
    await prisma.file.deleteMany({
      where: {
        folderId: req.params.id,
        userId: req.user.id,
      },
    });

    // Delete folder from database
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
