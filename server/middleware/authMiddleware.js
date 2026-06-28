const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/jwt");
const { isDenylisted } = require("../utils/tokenDenylist");

const verifyToken = (req, res, next) => {
  let token = req.cookies?.accessToken;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  if (isDenylisted(token)) {
    return res.status(401).json({ message: "Token has been invalidated. Please log in again." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = verifyToken;
