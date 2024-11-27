const express = require("express");
const { verifyToken } = require("../middleware/jwtver");
const { verifyAdmin } = require("../middleware/jwtver");

const Post = require("../models/post");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const PDFDocument = require("pdfkit"); // Import pdfkit

// Restricted words list
const containsRestrictedWords = (content) => {
  if (!content) return false; // Handle empty content

  // Regular expression to match words that start and end with a capital letter
  const regex = /\b[A-Z][a-zA-Z]*[A-Z]\b/g;

  return regex.test(content);
};

// Create a Post
router.post("/", verifyToken, async (req, res) => {
  const { title, content, thumbnail } = req.body;

  try {
    const isRestricted = containsRestrictedWords(content);

    const post = new Post({
      title,
      content,
      thumbnail,
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
    const limit = parseInt(req.query.limit) || 10; // Default: 10 posts per page
    const page = parseInt(req.query.page) || 1; // Default: Page 1
    const posts = await Post.find()
      .populate("author", "username")
      .skip((page - 1) * limit)
      .limit(limit);
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
  const { restricted } = req.body;

  try {
    // Find the post by ID
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Only admins or post authors can update restricted status
    if (req.user.role !== "admin" && post.author.toString() !== req.user.id) {
      return res.status(403).json({ error: "Access denied." });
    }

    // Update the restricted status
    post.restricted = restricted;
    await post.save();

    res.status(200).json({ message: "Post updated successfully.", post });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({ error: "Failed to update post." });
  }
});
router.get("/all", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, "-password"); // Exclude password
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
//block a user
router.put("/block/:id", verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent the admin from blocking themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ error: "You cannot block yourself." });
    }

    // Toggle the blocked status
    user.blocked = !user.blocked;
    await user.save();

    res.status(200).json({
      message: `User ${user.blocked ? "blocked" : "unblocked"} successfully.`,
      user,
    });
  } catch (error) {
    console.error("Error toggling block status:", error);
    res.status(500).json({ error: "Failed to update user block status." });
  }
});

// Delete a Post

router.get("/restricted", verifyToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;

    const posts = await Post.find({ restricted: true })
      .populate("author", "username")
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({ posts, currentPage: page });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/export", verifyToken, async (req, res) => {
  try {
    const { all, id } = req.query; // Query param to determine if a specific post or all posts should be exported
    let posts;

    if (id) {
      // Export a specific post by ID
      posts = await Post.find({ _id: id, author: req.user.id }).select(
        "title content"
      );
      if (!posts || posts.length === 0) {
        return res.status(404).json({ error: "Post not found." });
      }
    } else if (all && req.user.role === "admin") {
      // Admins can export all posts
      posts = await Post.find().select("title content");
    } else {
      // Users can export their own posts
      posts = await Post.find({ author: req.user.id }).select("title content");
    }

    // If no posts found
    if (!posts || posts.length === 0) {
      return res.status(404).json({ error: "No posts available to export." });
    }

    // Create a PDF document
    const doc = new PDFDocument();
    const filename = `posts_${Date.now()}.pdf`;

    // Set response headers for PDF
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");

    // Stream the PDF to the response
    doc.pipe(res);

    // Add content to the PDF
    doc.moveDown();

    // Add each post to the PDF
    posts.forEach((post, index) => {
      doc.fontSize(16).text(`${index + 1}. ${post.title}`, { bold: true });
      doc.moveDown();
      doc.fontSize(12).text(post.content);
      doc.moveDown();
    });

    // Finalize the document
    doc.end();
  } catch (error) {
    console.error("Error exporting posts:", error);
    res.status(500).json({ error: "Failed to export posts." });
  }
});

router.get("/stats/restricted", verifyToken, verifyAdmin, async (req, res) => {
  try {
    const restrictedCount = await Post.countDocuments({ restricted: true });

    res.status(200).json({
      message: "Restricted word stats retrieved successfully.",
      restrictedPosts: restrictedCount,
    });
  } catch (error) {
    console.error("Error fetching restricted word stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.delete("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the post from the database
    const post = await Post.findById(id);

    if (!post) {
      console.log("Post not found in database.");
      return res.status(404).json({ error: "Post not found" });
    }

    // Allow deletion if the user is either the post author or an admin
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      console.log("Access denied. Not the author or admin.");
      return res
        .status(403)
        .json({ error: "Access denied. Not authorized to delete this post." });
    }

    // Delete the post
    await Post.findByIdAndDelete(id);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
