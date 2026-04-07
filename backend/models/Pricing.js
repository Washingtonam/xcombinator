const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema({
  nin: {
    mode: {
      type: String,
      enum: ["bundle", "single"],
      default: "bundle", // 🔥 START WITH BUNDLE
    },
    unitPrice: {
      type: Number,
      default: 250,
    },
    agentPrice: {
      type: Number,
      default: 150,
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