const bcrypt = require("bcrypt");

async function displaySignup(req, res) {
  res.render("signup", { error: req.query.error });
}

async function createUser(req, res) {
  try {
    const { name, password } = req.body;

    // Basic validation
    if (!name || !password) {
      return res.redirect(
        "/auth/signup?error=Username and password are required",
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { name } });
    if (existingUser) {
      return res.redirect("/auth/signup?error=Username already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await prisma.user.create({
      data: {
        name,
        password: hashedPassword,
      },
    });

    res.redirect("/auth/login?success=Account created successfully");
  } catch (error) {
    console.error(error);
    res.redirect("/auth/signup?error=Error creating account");
  }
}

async function displayLogin(req, res) {
  res.render("login", { error: req.query.error });
}

async function logout(req, res) {
  req.logout((err) => {
    if (err) {
      return res.redirect("/?error=Failed to logout");
    }
    res.redirect("/auth/login");
  });
}

module.exports = {
  displaySignup,
  createUser,
  displayLogin,
  logout,
};
