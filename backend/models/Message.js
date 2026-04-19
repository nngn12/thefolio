// backend/models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    email:      { type: String, required: true, trim: true },
    message:    { type: String, required: true, trim: true },
    read:       { type: Boolean, default: false },
    // ── Admin reply ──
    adminReply: { type: String, default: '' },
    repliedAt:  { type: Date },
    // Link to registered user (if email matches an account)
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
