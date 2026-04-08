const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  // ==============================
  // 🧾 TYPE
  // ==============================
  type: {
    type: String,
    enum: [
      "UNIT_ADD",     // Admin adds units / payment approved
      "UNIT_DEDUCT",  // Manual deduction
      "NIN",          // NIN verification
      "BVN",          // BVN verification
    ],
    required: true,
  },

  // ==============================
  // 💰 MONEY (₦)
  // ==============================
  amount: {
    type: Number,
    default: 0, // used for funding
  },

  // ==============================
  // 🔢 UNITS
  // ==============================
  units: {
    type: Number,
    default: 0, // units added
  },

  unitsUsed: {
    type: Number,
    default: 0, // units consumed (e.g. NIN)
  },

  // ==============================
  // 📊 BUSINESS METRICS
  // ==============================
  cost: {
    type: Number,
    default: 0,
  },

  profit: {
    type: Number,
    default: 0,
  },

  // ==============================
  // 📌 STATUS
  // ==============================
  status: {
    type: String,
    enum: ["success", "pending", "failed"],
    default: "success",
  },

  // ==============================
  // 👤 USER
  // ==============================
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  // ==============================
  // 🆔 OPTIONAL DATA
  // ==============================
  nin: String,

  // ==============================
  // 🕒 DATE
  // ==============================
  date: {
    type: Date,
    default: Date.now,
  },

}, {
  timestamps: true,
});

module.exports = mongoose.model("Transaction", transactionSchema);