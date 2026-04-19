// backend/routes/admin.routes.js
const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Message = require("../models/Message");
const Post = require("../models/Post");

const { protect } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/role.middleware");
const { sendReplyEmail } = require("../utils/email");

// Apply middleware to all routes
router.use(protect, adminOnly);

// ── USERS ──────────────────────────────────────────────

// GET all non-admin users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("Fetch users error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Toggle user status
router.put("/users/:id/status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.role === "admin") {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();

    res.json({ message: `User is now ${user.status}`, user });
  } catch (err) {
    console.error("Update user status error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin accounts" });
    }

    await user.deleteOne();

    res.json({ message: "User deleted" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── POSTS ──────────────────────────────────────────────

// GET all posts
router.get("/posts", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Fetch posts error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── MESSAGES ───────────────────────────────────────────

// GET all messages
router.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    console.error("Fetch messages error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark message as read
router.put("/messages/:id/read", async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    if (!msg) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json(msg);
  } catch (err) {
    console.error("Mark read error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reply to message
router.post("/messages/:id/reply", async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply || !reply.trim()) {
      return res.status(400).json({ message: "Reply text is required" });
    }

    const msg = await Message.findById(req.params.id);

    if (!msg) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Save reply
    msg.adminReply = reply.trim();
    msg.repliedAt = new Date();
    msg.read = true;

    await msg.save();

    // Send email safely
    try {
      await sendReplyEmail(
        msg.email,
        msg.name,
        msg.message,
        reply.trim()
      );
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
      // Don't fail the whole request if email fails
    }

    res.json({ message: "Reply sent!", data: msg });
  } catch (err) {
    console.error("Reply error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete message
router.delete("/messages/:id", async (req, res) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json({ message: "Message deleted" });
  } catch (err) {
    console.error("Delete message error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;