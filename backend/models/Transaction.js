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
    default: 0,
  },

  // ==============================
  // 🔢 UNITS
  // ==============================
  units: {
    type: Number,
    default: 0,
  },

  unitsUsed: {
    type: Number,
    default: 0,
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
  // 📌 STATUS (🔥 FIXED HERE)
  // ==============================
  status: {
    type: String,
    enum: [
      "pending",   // waiting for admin
      "approved",  // admin approved
      "rejected",  // admin rejected
      "success",   // completed action (NIN/BVN)
      "failed",    // failed action
    ],
    default: "pending",
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
  // 📷 PROOF (🔥 YOU NEED THIS)
  // ==============================
  proof: {
    type: String,
    default: null,
  },

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

// ✅ FIX: prevent model crash on reload
module.exports =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);