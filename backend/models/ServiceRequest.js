const mongoose = require("mongoose");

const serviceRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  service: {
    type: String,
    enum: ["validation", "ipe", "modification"],
  },

  type: String, // e.g. "noRecord", "updateRecord"

  nin: String,

  slipType: {
    type: String,
    enum: ["none", "regular", "standard", "premium"],
    default: "none",
  },

  amount: Number,

  proof: String,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending",
  },

  resultSlip: String, // 🔥 PDF URL after processing

}, { timestamps: true });

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema);