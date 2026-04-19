// backend/routes/auth.routes.js
const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const OTP = require("../models/OTP");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth.middleware");
const { sendOTPEmail } = require("../utils/email");

const router = express.Router();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── Helper: generate 6-digit OTP ──
const makeOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// POST /api/auth/register  — Step 1: validate + send OTP
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: "All fields required" });
  try {
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password now so we don't store plaintext in OTP doc
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const otp = makeOTP();

    // Remove any previous OTP for this email
    await OTP.deleteMany({ email });

    // Save OTP + pending user data
    await OTP.create({ email, otp, userData: { name, email, hashedPassword: hashed } });

    // Send email
    await sendOTPEmail(email, name, otp);

    res.status(200).json({ message: "OTP sent to your email. Please verify to complete registration." });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Failed to send OTP. Check server email config." });
  }
});

// POST /api/auth/verify-otp  — Step 2: verify OTP and create account
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp)
    return res.status(400).json({ message: "Email and OTP are required" });
  try {
    const record = await OTP.findOne({ email });
    if (!record)
      return res.status(400).json({ message: "OTP expired or not found. Please register again." });
    if (record.otp !== otp)
      return res.status(400).json({ message: "Incorrect OTP. Please try again." });

    const { name, hashedPassword } = record.userData;

    // Use insertOne to bypass Mongoose pre-save hook for the already hashed password
    const result = await User.collection.insertOne({
      name,
      email,
      password: hashedPassword,
      role: 'member',
      status: 'active',
      bio: '',
      profilePic: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await OTP.deleteMany({ email });

    // Fetch the newly created user without the password field
    const createdUser = await User.findById(result.insertedId).select("-password");

    res.status(201).json({
      token: generateToken(createdUser._id),
      user: createdUser, // ✅ FIXED: Now returns the full user object (including empty bio/pic)
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/resend-otp
router.post("/resend-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email required" });
  try {
    const record = await OTP.findOne({ email });
    if (!record)
      return res.status(400).json({ message: "No pending registration found. Please register again." });

    const otp = makeOTP();
    record.otp = otp;
    record.createdAt = new Date();
    await record.save();

    await sendOTPEmail(email, record.userData.name, otp);
    res.json({ message: "New OTP sent to your email." });
  } catch (err) {
    res.status(500).json({ message: "Failed to resend OTP." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });
  try {
    // Select the password here explicitly if your model has `select: false` on it, 
    // otherwise just finding the user is fine.
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });
    if (user.status === "inactive")
      return res.status(403).json({ message: "Account deactivated. Contact admin." });

    const match = await user.matchPassword(password);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password" });

    // Fetch the clean user object without the password to send to the frontend
    const cleanUser = await User.findById(user._id).select("-password");

    res.json({
      token: generateToken(user._id),
      user: cleanUser, // ✅ FIXED: Ensures login returns the exact same object shape as /me
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/profile
router.put("/profile", protect, upload.single("profilePic"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (req.body.name) user.name = req.body.name;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    if (req.file) user.profilePic = req.file.filename;

    await user.save();

    const updated = await User.findById(user._id).select("-password");
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/auth/change-password
router.put("/change-password", protect, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "Both fields required" });
  if (newPassword.length < 6)
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  try {
    const user = await User.findById(req.user._id);
    const match = await user.matchPassword(currentPassword);
    if (!match)
      return res.status(401).json({ message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save(); // IMPORTANT: Ensure your User model has a pre('save') hook to hash this new password!

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;