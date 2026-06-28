const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN } = require("../../config/jwt");

const googleAuthCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/login?error=Authentication failed");
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Redirect to frontend with token
    // Uses /#/ prefix because the client uses HashRouter
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";

    res.redirect(`${frontendURL}/#/auth/success?token=${token}&user=${encodeURIComponent(JSON.stringify({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role,
      profilePicture: req.user.profilePicture
    }))}`);
  } catch (error) {
    console.error("Google Auth Callback Error:", error);
    res.redirect("/login?error=Internal server error");
  }
};

module.exports = { googleAuthCallback };
