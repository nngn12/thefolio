// backend/routes/post.routes.js
const express = require("express");
const Post    = require("../models/Post");
const Comment = require("../models/Comment");
const { protect }       = require("../middleware/auth.middleware");
const { memberOrAdmin } = require("../middleware/role.middleware");
const upload            = require("../middleware/upload");

const router = express.Router();

// GET /api/posts — all published posts (public)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find({ status: "published" })
      .populate("author", "name profilePic")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/mine — MUST be before /:id
router.get("/mine", protect, async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/posts/:id
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name profilePic");
    if (!post || post.status === "removed")
      return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/posts — create
router.post("/", protect, memberOrAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, body } = req.body;
    const image = req.file ? req.file.filename : "";
    const post  = await Post.create({ title, body, image, author: req.user._id });
    await post.populate("author", "name profilePic");
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/posts/:id — update
router.put("/:id", protect, memberOrAdmin, upload.single("image"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: "Not authorized" });
    if (req.body.title) post.title = req.body.title;
    if (req.body.body)  post.body  = req.body.body;
    if (req.file)       post.image = req.file.filename;
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/posts/:id
router.delete("/:id", protect, memberOrAdmin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: "Not authorized" });
    await post.deleteOne();
    await Comment.deleteMany({ post: req.params.id });
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;