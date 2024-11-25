const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");


// Example Schema
const TestSchema = new mongoose.Schema({ name: String });
const TestModel = mongoose.model("Test", TestSchema);

// Test Route
router.get("/", async (req, res) => {
  try {
    const testDoc = await TestModel.create({ name: "MongoDB Test" });
    res.status(200).json({ success: true, data: testDoc });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
