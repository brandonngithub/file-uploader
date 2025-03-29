const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const prisma = require("../db");

passport.use(
  new LocalStrategy(
    {
      usernameField: "name", // Match the form field (`name="name"`)
      passwordField: "password",
    },
    async (name, password, done) => {
      try {
        const user = await prisma.user.findUnique({ where: { name } });
        if (!user) {
          return done(null, false, { message: "Incorrect username." });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;
