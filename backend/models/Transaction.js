const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["UNIT_ADD", "UNIT_DEDUCT", "NIN", "BVN", "SERVICE"],
    required: true,
  },

  amount: {
    type: Number,
    default: 0,
  },

  units: {
    type: Number,
    default: 0,
  },

  unitsUsed: {
    type: Number,
    default: 0,
  },

  cost: {
    type: Number,
    default: 0,
  },

  profit: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "success", "failed"],
    default: "pending",
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  nin: String,

  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceRequest",
  },

  proof: {
    type: String,
    default: null,
  },

}, { timestamps: true });

module.exports =
  mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);