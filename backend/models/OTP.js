// backend/models/OTP.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email:     { type: String, required: true },
  otp:       { type: String, required: true },
  userData:  { type: Object, required: true }, // stores { name, email, hashedPassword }
  createdAt: { type: Date, default: Date.now, expires: 600 }, // auto-delete after 10 min
});

module.exports = mongoose.model('OTP', otpSchema);
