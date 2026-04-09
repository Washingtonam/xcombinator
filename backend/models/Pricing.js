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
// 🔥 NIN SERVICES
// ==============================
  ninServices: {
    validation: {
      noRecord: { type: Number, default: 1000 },
      updateRecord: { type: Number, default: 1150 },
      validateModification: { type: Number, default: 1150 },
      vnin: { type: Number, default: 1000 },
      photoError: { type: Number, default: 1150 },
      bypass: { type: Number, default: 1150 },
    },

    ipe: {
      inProcessingError: { type: Number, default: 1000 },
      stillProcessing: { type: Number, default: 1000 },
      newEnrollment: { type: Number, default: 1000 },
      invalidTracking: { type: Number, default: 1000 },
    },

    slipPrice: {
      type: Number,
      default: 150,
    }
  }


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