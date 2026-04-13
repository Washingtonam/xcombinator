const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  // ==============================
  // 🧾 TYPE
  // ==============================
  type: {
    type: String,
    enum: [
      "UNIT_ADD",
      "UNIT_DEDUCT",
      "NIN",
      "BVN",
      "SERVICE", // 🔥 ADD THIS (VERY IMPORTANT)
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
  // 📌 STATUS
  // ==============================
  status: {
    type: String,
    enum: [
      "pending",
      "approved",
      "rejected",
      "success",
      "failed",
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

  // 🔥 ADD THIS (LINK TO REQUEST)
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceRequest",
  },

  // ==============================
  // 📷 PROOF
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

// ✅ SAFE EXPORT
module.exports =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);