const mongoose = require("mongoose");

const ADMIN_EMAIL = "washingtonamedu@gmail.com";

const userSchema = new mongoose.Schema({
  // ==============================
  // 👤 BASIC INFO
  // ==============================
  firstName: {
    type: String,
    default: "",
    trim: true,
  },

  lastName: {
    type: String,
    default: "",
    trim: true,
  },

  nin: {
    type: String,
    default: "",
    trim: true,
  },

  // ==============================
  // 📧 AUTH
  // ==============================
  email: {
    type: String,
    required: true,
    unique: true, // ✅ keep this
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  // ==============================
  // 💰 WALLET SYSTEM
  // ==============================
  units: {
    type: Number,
    default: 0,
    min: 0,
  },

  // 🔁 legacy support (optional)
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },

  // ==============================
  // 🚦 ACCOUNT STATUS
  // ==============================
  status: {
    type: String,
    enum: ["active", "suspended"],
    default: "active",
  },

  // ==============================
  // 🔥 ROLE SYSTEM (UPGRADE)
  // ==============================
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

}, {
  timestamps: true,
});

// ❌ REMOVE DUPLICATE INDEX (IMPORTANT)
// userSchema.index({ email: 1 }, { unique: true });

// ==============================
// 🔥 AUTO-SET ADMIN ROLE
// ==============================
userSchema.pre("save", function (next) {
  if (
    this.email &&
    this.email.toLowerCase().trim() === ADMIN_EMAIL
  ) {
    this.role = "admin";
  }
  next();
});

// ✅ FIX: PREVENT MODEL DUPLICATION (VERY IMPORTANT)
module.exports = mongoose.models.User || mongoose.model("User", userSchema);