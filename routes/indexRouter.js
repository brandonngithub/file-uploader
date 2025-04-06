const express = require("express");
const ensureAuthenticated = require("../middlewares/auth.js");
const indexController = require("../controllers/indexController.js");

const indexRouter = express();

// Display home page
indexRouter.get("/", ensureAuthenticated, indexController.displayIndex);

module.exports = indexRouter;
