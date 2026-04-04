const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema({
  nin: { type: Number, default: 350 },
  bvn: { type: Number, default: 100 },
  premium: { type: Number, default: 500 },
}, { timestamps: true });

module.exports = mongoose.model("Pricing", pricingSchema);

module.exports = {
  nin: {
    unitPrice: 250,
    agentPrice: 200,
  }
};