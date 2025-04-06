const express = require("express");
const ensureAuthenticated = require("../middlewares/auth.js");
const folderController = require("../controllers/folderController.js");

const folderRouter = express();

// Route for creating new folder
folderRouter.post("/", ensureAuthenticated, folderController.createFolder);

// Display folder
folderRouter.get("/:id", ensureAuthenticated, folderController.displayFolder);

// Route for deleting a folder
folderRouter.delete("/:id", ensureAuthenticated, folderController.deleteFolder);

// Route for renaming a folder
folderRouter.patch(
  "/:id/rename",
  ensureAuthenticated,
  folderController.renameFolder,
);

module.exports = folderRouter;
