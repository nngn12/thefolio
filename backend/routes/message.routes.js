// backend/routes/message.routes.js
const express = require("express");
const Message = require("../models/Message");
const User = require("../models/User");
const { protect } = require("../middleware/auth.middleware");

// Make sure to import your email utility if you are using it!
// const { sendGuestMessageEmail } = require("../utils/email");

const router = express.Router();

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

// POST /api/messages/guest — Unprotected route for non-logged in users (UPDATED)
router.post("/guest", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Name, email, and message are required." });
  }

  try {
    // 1. Try to see if this guest email actually belongs to a registered user
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // 2. Save it to MongoDB so the Dashboards can see it!
    const msg = await Message.create({
      name,
      email: email.toLowerCase().trim(),
      message,
      userId: user ? user._id : null, // Link it if they have an account
    });

    // 3. Send the email notification
    if (typeof sendGuestMessageEmail === 'function') {
      await sendGuestMessageEmail(name, email, message);
    }

    res.status(200).json({ message: "Your message has been sent!", data: msg });
  } catch (error) {
    console.error("Guest email error:", error);
    res.status(500).json({ message: "Failed to send message. Please try again later." });
  }
});

module.exports = router;
