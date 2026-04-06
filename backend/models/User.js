const mongoose = require("mongoose");

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
  },

  // ==============================
  // 📧 AUTH
  // ==============================
  email: {
    type: String,
    required: true,
    unique: true,
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
  },

  // 🔁 legacy support (optional)
  balance: {
    type: Number,
    default: 0,
  },

  // ==============================
  // 🚦 ACCOUNT STATUS
  // ==============================
  status: {
    type: String,
    enum: ["active", "suspended"],
    default: "active",
  },

}, {
  timestamps: true,
});

// ==============================
// 🔐 INDEX (ENSURES UNIQUE EMAIL)
// ==============================
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);