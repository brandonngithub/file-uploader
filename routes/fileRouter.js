const express = require("express");
const fileController = require("../controllers/fileController.js");
const ensureAuthenticated = require("../middlewares/auth");
const upload = require("../middlewares/upload");

const fileRouter = express();

// Route for creating a new file
fileRouter.post(
  "/",
  ensureAuthenticated,
  upload.single("file"), // Still use multer to get file buffer
  fileController.createFile,
);

// Route for deleting a file
fileRouter.delete("/:id", ensureAuthenticated, fileController.deleteFile);

// Route for renaming a file
fileRouter.patch(
  "/:id/rename",
  ensureAuthenticated,
  express.json(),
  fileController.renameFile,
);

// Display file details
fileRouter.get("/:id", ensureAuthenticated, fileController.displayFile);

module.exports = fileRouter;
