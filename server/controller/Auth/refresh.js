const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_SECRET, REFRESH_TOKEN_EXPIRES_IN } = require("../../config/jwt");

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    try {
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

      const newAccessToken = jwt.sign(
        { userId: decoded.userId || decoded.id, email: decoded.email, username: decoded.username, role: decoded.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const newRefreshToken = jwt.sign(
        { userId: decoded.userId || decoded.id, email: decoded.email, username: decoded.username, role: decoded.role },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
      );

      const isProd = process.env.NODE_ENV === "production";

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000 // 15 mins
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      return res.status(200).json({ success: true, message: "Token refreshed successfully" });
    } catch (_err) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }
  } catch (error) {
    console.error("Refresh token error:", error);
    next(error);
  }
};

module.exports = refresh;
