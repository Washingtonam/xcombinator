const mongoose = require("mongoose");

// ==============================
// 💬 COMMENT SCHEMA (CHAT STYLE)
// ==============================
const commentSchema = new mongoose.Schema({
  text: String,
  by: String, // email or "admin"
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "admin",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// ==============================
// 🧾 STATUS HISTORY (🔥 FINTECH FEEL)
// ==============================
const statusHistorySchema = new mongoose.Schema({
  status: String,
  note: String,
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
  // 🔥 FULL FORM DATA
  // =========================
  formData: {
    type: Object,
    default: {},
  },

  // =========================
  // 🧠 ADMIN NOTES (PRIVATE)
  // =========================
  adminNotes: {
    type: String,
    default: "",
  },

  // =========================
  // 💬 COMMENTS (VISIBLE TO USER)
  // =========================
  comments: [commentSchema],

  // =========================
  // 📊 STATUS
  // =========================
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },

  // =========================
  // 🧾 STATUS HISTORY (🔥 NEW)
  // =========================
  statusHistory: {
    type: [statusHistorySchema],
    default: [],
  },

  // =========================
  // 📎 RESULT
  // =========================
  resultSlip: String,

}, { timestamps: true });

// ==============================
// 🔥 AUTO TRACK STATUS CHANGES
// ==============================
serviceRequestSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      note: `Status changed to ${this.status}`,
    });
  }
  next();
});

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);