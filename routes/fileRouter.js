const express = require("express");
const upload = require("../middlewares/upload.js");
const ensureAuthenticated = require("../middlewares/auth.js");
const fileController = require("../controllers/fileController.js");

const fileRouter = express();

// Route for creating a new file
fileRouter.post(
  "/",
  ensureAuthenticated,
  upload.single("file"), // Use multer to get file buffer
  fileController.createFile,
);

// Route for deleting a file
fileRouter.delete("/:id", ensureAuthenticated, fileController.deleteFile);

// Route for renaming a file
fileRouter.patch("/:id/rename", ensureAuthenticated, fileController.renameFile);

// Display file details
fileRouter.get("/:id", ensureAuthenticated, fileController.displayFile);

module.exports = fileRouter;
