const express = require("express");
const authController = require("../controllers/authController.js");
const ensureAuthenticated = require("../middlewares/auth");
const passport = require("../middlewares/passport");

const authRouter = express();

// Display signup form
authRouter.get("/signup", authController.displaySignup);

// Route used in signup to create new user
authRouter.post("/signup", authController.createUser);

// Display login form
authRouter.get("/login", authController.displayLogin);

// Route for checking credentials to see if can log in or not
authRouter.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login?error=Invalid credentials",
    failureFlash: false,
  }),
);

// Route for logging out of app
authRouter.get("/logout", ensureAuthenticated, authController.logout);

module.exports = authRouter;
