const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  blocked: { type: Boolean, default: false }, // New field to indicate if a user is blocked
});

module.exports = mongoose.model("User", userSchema);
