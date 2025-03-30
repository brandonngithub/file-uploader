const express = require("express");
const indexController = require("../controllers/indexController.js");
const ensureAuthenticated = require("../middlewares/auth");

const indexRouter = express();

indexRouter.get("/", ensureAuthenticated, indexController.displayIndex);

module.exports = indexRouter;
