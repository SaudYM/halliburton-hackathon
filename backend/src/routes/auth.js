const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const router = express.Router();

// Sign Up Route
router.post("/signup", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // If the role is 'admin', check if an admin already exists
    if (role === "admin") {
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(200).json({ replaceAdmin: true }); // Prompt the frontend for confirmation
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ username, password: hashedPassword, role });
    await user.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Sign In Route
router.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  if (!username || typeof username !== "string") {
    return res.status(400).json({ error: "Invalid username" });
  }
  if (!password) {
    return res.status(400).json({ error: "Password is required" });
  }
  
  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Verify the password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET , {
      expiresIn: "1h",
    });

    res.status(200).json({ token, role: user.role });
  } catch (error) {
    console.error("Error during sign in:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/replace-admin", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    console.log("Replacing admin triggered with data:", req.body);

    await User.deleteOne({ role: "admin" }); // Remove the current admin

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new User({ username, password: hashedPassword, role });
    await newAdmin.save();

    res.status(201).json({ message: "Administrator replaced successfully" });
  } catch (error) {
    console.error("Error replacing admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
module.exports = router;
