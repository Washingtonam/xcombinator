const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema({
  nin: {
    unitPrice: {
      type: Number,
      default: 250, // 🔥 price per verification
    },
    agentPrice: {
      type: Number,
      default: 150, // 🔥 agent bulk price
    },
  },

  bvn: {
    unitPrice: {
      type: Number,
      default: 200,
    },
  },

}, { timestamps: true });

module.exports = mongoose.model("Pricing", pricingSchema);