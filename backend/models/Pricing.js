const mongoose = require("mongoose");

const pricingSchema = new mongoose.Schema({
  // ==============================
  // 🆔 NIN PRICING
  // ==============================
  nin: {
    mode: {
      type: String,
      enum: ["bundle", "single"],
      default: "bundle",
    },

    unitPrice: {
      type: Number,
      required: true,
      default: 250,
      min: 1, // 🔥 prevents zero or negative pricing
    },

    agentPrice: {
      type: Number,
      default: 150,
      min: 1,
    },
  },

  // ==============================
  // 🏦 BVN PRICING
  // ==============================
  bvn: {
    unitPrice: {
      type: Number,
      default: 200,
      min: 1,
    },
  },

}, {
  timestamps: true,
});

// ==============================
// 🔥 ENSURE SINGLE DOCUMENT ONLY
// ==============================
pricingSchema.statics.getPricing = async function () {
  let pricing = await this.findOne();

  if (!pricing) {
    pricing = await this.create({});
  }

  return pricing;
};

module.exports = mongoose.model("Pricing", pricingSchema);