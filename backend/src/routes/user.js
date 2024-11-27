const express = require("express");
const { verifyToken, verifyAdmin } = require("../middleware/jwtver");
const User = require("../models/user");
const Post = require("../models/post"); // Import the Post model

const router = express.Router();
// Example protected route
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const restrictedCount = await Post.countDocuments({ restricted: true });
      return res.status(200).json({
        message: "Welcome to your admin dashboard!",
        restrictedPosts: restrictedCount,
        user: req.user,
      });
    }

    // For regular users
    res.status(200).json({
      message: "Welcome to your dashboard!",
      user: req.user,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.put("/block/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { blocked: true }, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: `User ${user.username} has been blocked.`, user });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Unblock a User
router.put("/unblock/:id", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { blocked: false }, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: `User ${user.username} has been unblocked.`, user });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude passwords
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
