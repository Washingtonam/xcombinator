const mongoose = require("mongoose");

const paymentRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  amount: {
    type: Number,
    required: true,
  },

  proof: {
    type: String, // base64 image
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

}, {
  timestamps: true
});

module.exports = mongoose.model("PaymentRequest", paymentRequestSchema);