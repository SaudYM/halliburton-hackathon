const express = require("express");
const multer = require("multer"); // For handling file uploads
const cloudinary = require("../config/cloudinary");
const router = express.Router();
const upload = multer({
    dest: "uploads/",
    fileFilter: (req, file, cb) => {
      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.mimetype)) {
        return cb(new Error("Only image files are allowed"), false);
      }
      cb(null, true);
    },
  });
  
// Upload an image
router.post("/", upload.single("image"), async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "thumbnails",
      });
  
      // Cleanup temporary file
      const fs = require("fs");
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete temp file:", err);
      });
  
      res.status(200).json({ url: result.secure_url });
    } catch (error) {
      res.status(500).json({ error: "Failed to upload image" });
    }
  });
  

module.exports = router;
