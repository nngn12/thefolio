// backend/routes/admin.routes.js
const express = require("express");
const User    = require("../models/User");
const Message = require("../models/Message");
const Post    = require("../models/Post");

const { protect }   = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/role.middleware");
const { sendReplyEmail } = require("../utils/email");

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// ── USERS ──────────────────────────────────────────────
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "admin" } })
      .select("-password")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/users/:id/status", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role === "admin")
      return res.status(404).json({ message: "User not found" });
    user.status = user.status === "active" ? "inactive" : "active";
    await user.save();
    res.json({ message: `User is now ${user.status}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin accounts' });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── MESSAGES ───────────────────────────────────────────
router.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/messages/:id/read", async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!msg) return res.status(404).json({ message: "Message not found" });
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/admin/messages/:id/reply — admin replies to a message via email
router.post("/messages/:id/reply", async (req, res) => {
  const { reply } = req.body;
  if (!reply || !reply.trim())
    return res.status(400).json({ message: "Reply text is required" });
  try {
    const msg = await Message.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    // Save reply to DB (visible in user dashboard)
    msg.adminReply = reply.trim();
    msg.repliedAt  = new Date();
    msg.read       = true;
    await msg.save();

    // Send email notification
    await sendReplyEmail(msg.email, msg.name, msg.message, reply.trim());

    res.json({ message: "Reply sent!", data: msg });
  } catch (err) {
    console.error("Reply error:", err);
    res.status(500).json({ message: "Failed to send reply: " + err.message });
  }
});

router.delete("/messages/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
