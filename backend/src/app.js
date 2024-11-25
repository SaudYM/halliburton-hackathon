// Import required modules
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// Import route handlers
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const uploadRoutes = require("./routes/uploads");
const testRoutes = require("./routes/test");
const postRoutes = require("./routes/posts");

// Initialize the app
const app = express();

// ==========================
// Middleware Configuration
// ==========================
app.use(express.json()); // Parse incoming JSON requests
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded data
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(helmet()); // Enhance security by setting HTTP headers

// ==========================
// Routes
// ==========================

// Base route for quick server check
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// Route for testing API
app.get("/api/test", (req, res) => {
  res.json({ message: "Hello from the backend!" });
});

// Route handlers for specific API routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/user", userRoutes); // User-related routes
app.use("/api/uploads", uploadRoutes); // File upload routes
app.use("/api/test", testRoutes); // Test routes
app.use("/api/posts", postRoutes); // Post-related routes
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// ==========================
// Export the app
// ==========================
module.exports = app;
