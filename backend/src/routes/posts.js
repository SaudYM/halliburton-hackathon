const express = require("express");
const verifyToken = require("../middleware/jwtver"); // JWT middleware
const Post = require("../models/post");
const router = express.Router();

// Restricted words list
const restrictedWords = ["badword1", "badword2", "badword3"];

// Helper function to check for restricted words
const containsRestrictedWords = (content) => {
  return restrictedWords.some((word) => content.includes(word));
};

// Create a Post
router.post("/", verifyToken, async (req, res) => {
  const { title, content } = req.body;

  try {
    const isRestricted = containsRestrictedWords(content);

    const post = new Post({
      title,
      content,
      author: req.user.id, 
      restricted: isRestricted,
    });
    await post.save();

    res.status(201).json({ message: "Post created successfully", post });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get All Posts (Admin only)
router.get("/", verifyToken, async (req, res) => {
  try {
    // If the user is not an admin, restrict access
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const posts = await Post.find().populate("author", "username");
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get User's Posts
router.get("/my", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id });
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a Post
router.put("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    // Check for restricted words
    const isRestricted = containsRestrictedWords(content);

    // Find and update the post
    const post = await Post.findOneAndUpdate(
      { _id: id, author: req.user.id }, // Ensure the user owns the post
      { title, content, restricted: isRestricted },
      { new: true } // Return the updated post
    );

    if (!post) {
      return res.status(404).json({ error: "Post not found or not authorized" });
    }

    res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a Post
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findOneAndDelete({
      _id: id,
      author: req.user.id, // Ensure the user owns the post
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found or not authorized" });
    }

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
