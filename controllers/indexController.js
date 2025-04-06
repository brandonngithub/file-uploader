const prisma = require("../prisma/db.js");
const { formatFileSize, formatDate } = require("../middlewares/helper.js");

async function displayIndex(req, res) {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
    });

    const files = await prisma.file.findMany({
      where: {
        folderId: null, // Only files not in folders
        userId: req.user.id,
      },
    });

    const formattedFolders = folders.map((folder) => ({
      ...folder,
      createdAt: formatDate(folder.createdAt),
    }));

    const formattedFiles = files.map((file) => ({
      ...file,
      size: formatFileSize(file.size),
      createdAt: formatDate(file.createdAt),
    }));

    res.render("index", {
      folders: formattedFolders,
      files: formattedFiles,
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
}

module.exports = {
  displayIndex,
};
