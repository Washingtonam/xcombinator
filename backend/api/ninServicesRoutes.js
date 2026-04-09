const express = require("express");
const router = express.Router();

const ServiceRequest = require("../models/ServiceRequest");
const Pricing = require("../models/Pricing");
const User = require("../models/User");

// ==============================
// 📤 CREATE REQUEST (WITH PAYMENT)
// ==============================
router.post("/nin-services/request", async (req, res) => {
  try {
    const { userId, service, type, nin, slipType, proof } = req.body;

    if (!userId || !service || !type || !nin || !proof) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const pricing = await Pricing.findOne();

    let basePrice = 0;

    if (service === "validation") {
      basePrice = pricing.ninServices.validation[type];
    }

    if (service === "ipe") {
      basePrice = pricing.ninServices.ipe[type];
    }

    const slipPrice = slipType === "none" ? 0 : pricing.ninServices.slipPrice;

    const total = basePrice + slipPrice;

    const request = await ServiceRequest.create({
      userId,
      service,
      type,
      nin,
      slipType,
      amount: total,
      proof,
    });

    res.json({
      message: "Request submitted",
      request,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed" });
  }
});

// ==============================
// 📥 ADMIN GET REQUESTS
// ==============================
router.get("/admin/requests", async (req, res) => {
  const data = await ServiceRequest.find()
    .populate("userId", "email")
    .sort({ createdAt: -1 });

  res.json(data);
});

// ==============================
// ✅ APPROVE
// ==============================
router.post("/admin/requests/:id/approve", async (req, res) => {
  const request = await ServiceRequest.findById(req.params.id);

  request.status = "approved";

  await request.save();

  res.json({ message: "Approved" });
});

// ==============================
// ❌ REJECT
// ==============================
router.post("/admin/requests/:id/reject", async (req, res) => {
  const request = await ServiceRequest.findById(req.params.id);

  request.status = "rejected";

  await request.save();

  res.json({ message: "Rejected" });
});

// ==============================
// 📤 UPLOAD RESULT SLIP
// ==============================
router.post("/admin/requests/:id/upload-slip", async (req, res) => {
  try {
    const { pdf } = req.body;

    if (!pdf) {
      return res.status(400).json({ message: "PDF required" });
    }

    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.resultSlip = pdf;
    request.status = "completed";

    await request.save();

    res.json({
      message: "Slip uploaded & request completed",
    });

  } catch (error) {
    console.error("UPLOAD SLIP ERROR:", error);
    res.status(500).json({ message: "Upload failed" });
  }
});

module.exports = router;