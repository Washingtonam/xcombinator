const mongoose = require("mongoose");

// ==============================
// 💬 COMMENT SCHEMA (MULTI ADMIN)
// ==============================
const commentSchema = new mongoose.Schema({
  text: String,
  by: String,
  date: {
    type: Date,
    default: Date.now,
  },
});

// ==============================
// 🧾 SERVICE REQUEST
// ==============================
const serviceRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  service: {
    type: String,
    enum: ["validation", "ipe", "modification"],
  },

  type: String,

  nin: String,

  slipType: {
    type: String,
    enum: ["none", "regular", "standard", "premium"],
    default: "none",
  },

  amount: Number,

  proof: String,

  // =========================
  // 🔥 FULL FORM DATA (CRITICAL)
  // =========================
  formData: {
    type: Object,
    default: {},
  },

  // =========================
  // 🧠 ADMIN NOTES
  // =========================
  adminNotes: {
    type: String,
    default: "",
  },

  // =========================
  // 💬 COMMENTS (TEAM SYSTEM)
  // =========================
  comments: [commentSchema],

  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },

  resultSlip: String,

}, { timestamps: true });

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);