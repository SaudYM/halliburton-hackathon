const express = require("express");
const verifyToken = require("../middleware/jwtver"); // Import middleware
const router = express.Router();

// Example protected route
router.get("/dashboard", verifyToken, (req, res) => {
  res.status(200).json({
    message: "Welcome to your dashboard!",
    user: req.user, // Access user info from the decoded token
  });
});

module.exports = router;
