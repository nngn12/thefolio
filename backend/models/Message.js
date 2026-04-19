const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // The person who started the thread (User or Admin)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // The person intended to receive the message
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Keep these for legacy/guest support, but we rely on IDs for logic
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },

    subject: { type: String, default: "New Message" },
    message: { type: String, required: true, trim: true },
    read: { type: Boolean, default: false },

    // ── THE CONVERSATION THREAD ──
    // This allows both parties to reply multiple times
    replies: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);