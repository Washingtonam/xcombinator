const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  type: {
    type: String, // FUND, NIN, BVN
    required: true,
  },
  amount: Number,
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
    default: "success",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  nin: String,
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Transaction", transactionSchema);