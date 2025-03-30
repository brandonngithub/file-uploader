const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("./middlewares/passport");
const indexRouter = require("./routes/indexRouter");
const folderRouter = require("./routes/folderRouter");
const fileRouter = require("./routes/fileRouter");
const authRouter = require("./routes/authRouter");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);
app.use(passport.session());

app.use("/", indexRouter);
app.use("/folder", folderRouter);
app.use("/file", fileRouter);
app.use("/auth", authRouter);

app.listen(3000, () => console.log("Listening on port 3000"));
