const prisma = require("../db");

async function displayIndex(req, res) {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id }, // Only show current user's folders
    });

    const files = await prisma.file.findMany({
      where: {
        folderId: null, // Only files not in folders
        userId: req.user.id, // Only show current user's files
      },
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
}

module.exports = {
  displayIndex,
};
