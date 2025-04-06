const express = require("express");
const path = require("path");
const session = require("express-session");
const { PrismaSessionStore } = require("@quixo3/prisma-session-store");
const passport = require("./middlewares/passport.js");
const prisma = require("./prisma/db.js");
const indexRouter = require("./routes/indexRouter.js");
const authRouter = require("./routes/authRouter.js");
const fileRouter = require("./routes/fileRouter.js");
const folderRouter = require("./routes/folderRouter.js");

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    store: new PrismaSessionStore(prisma, {
      dbRecordIdIsSessionId: true, // use session ID as database record ID
      logger: console,
    }),
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  }),
);
app.use(passport.session());

app.use("/", indexRouter);
app.use("/auth", authRouter);
app.use("/file", fileRouter);
app.use("/folder", folderRouter);

app.listen(3000, () => console.log("Listening on port 3000"));
