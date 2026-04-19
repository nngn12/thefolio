// backend/routes/message.routes.js
const express = require("express");
const Message = require("../models/Message");
const User    = require("../models/User");
const { protect } = require("../middleware/auth.middleware");
const router  = express.Router();

// POST /api/messages — anyone can send (guest or member)
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ message: "All fields are required" });

    // Try to link to a registered user
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    const msg = await Message.create({
      name,
      email,
      message,
      userId: user ? user._id : null,
    });
    res.status(201).json({ message: "Message sent!", data: msg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/messages/my — get messages (and admin replies) for the logged-in user
router.get("/my", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    // Match by userId OR by email
    const messages = await Message.find({
      $or: [
        { userId: user._id },
        { email: user.email },
      ],
    }).sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
