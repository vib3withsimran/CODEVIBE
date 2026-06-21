const jwt = require("jsonwebtoken");

const googleAuthCallback = (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/login?error=Authentication failed");
    }

    const { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN } = require("../../config/jwt");

    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role },
      REFRESH_TOKEN_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      maxAge: 15 * 60 * 1000 // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Redirect to frontend without token in URL
    // Uses /#/ prefix because the client uses HashRouter
    const frontendURL = process.env.FRONTEND_URL || "http://localhost:5173";
    
    res.redirect(`${frontendURL}/#/auth/success?user=${encodeURIComponent(JSON.stringify({
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
