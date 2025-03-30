const express = require("express");
const indexController = require("../controllers/indexController.js");
const ensureAuthenticated = require("../middlewares/auth");

const indexRouter = express();

// Display home page
indexRouter.get("/", ensureAuthenticated, indexController.displayIndex);

module.exports = indexRouter;
