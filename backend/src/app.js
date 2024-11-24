const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const app = express();
const userRoutes = require("./routes/user");


// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
const testRoutes = require("./routes/test");
app.use("/api/test", testRoutes);
const postRoutes = require("./routes/posts");
app.use("/api/posts", postRoutes);
// Routes
app.get("/", (req, res) => {
  res.send("Backend is working!");
});
app.get("/api/test", (req, res) => {
    res.json({ message: "Hello from the backend!" });
  });
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
