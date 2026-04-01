const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  amount: Number,

  proof: String, // image URL or base64

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

}, {
  timestamps: true
});

module.exports = mongoose.model("Payment", paymentSchema);