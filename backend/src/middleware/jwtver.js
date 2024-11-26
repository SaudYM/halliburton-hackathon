const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Import the User model

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.blocked) {
      return res.status(403).json({ error: "Your account has been blocked." });
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    res.status(401).json({ error: "Invalid token" });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Access denied. Admins only." });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };
