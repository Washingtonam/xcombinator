const express = require("express");
const router = express.Router();

const ServiceRequest = require("../models/ServiceRequest");
const Pricing = require("../models/Pricing");
const Transaction = require("../models/Transaction");

// ==============================
// 📤 CREATE REQUEST (LOCKED PAYMENT FLOW)
// ==============================
router.post("/nin-services/request", async (req, res) => {
  try {
    const {
      userId,
      service,
      type,
      nin,
      slipType,
      proof,
      formData // 🔥 NEW
    } = req.body;

    if (!userId || !service || !type || !nin || !proof) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const pricing = await Pricing.getPricing();

    let basePrice = 0;

    if (service === "validation") {
      basePrice = pricing.ninServices.validation?.[type];
    } else if (service === "ipe") {
      basePrice = pricing.ninServices.ipe?.[type];
    } else if (service === "modification") {
      basePrice = pricing.ninServices.modification?.[type];
    }

    if (!basePrice) {
      return res.status(400).json({
        message: "Invalid service type selected",
      });
    }

    let slipCost = 0;

    if (service === "validation") {
      slipCost =
        slipType === "none"
          ? 0
          : pricing.ninServices.slipPrice || 0;
    }

    const total = basePrice + slipCost;

    // =========================
    // CREATE REQUEST
    // =========================
    const request = await ServiceRequest.create({
      userId,
      service,
      type,
      nin,
      slipType: slipType || "none",
      amount: total,
      proof,
      formData: formData || {}, // 🔥 SAVE FORM
      status: "pending",
    });

    // =========================
    // CREATE TRANSACTION
    // =========================
    await Transaction.create({
      type: "SERVICE",
      amount: total,
      status: "pending",
      userId,
      nin,
      proof,
      requestId: request._id,
    });

    res.json({
      message: "Request submitted successfully",
      request,
    });

  } catch (err) {
    console.error("CREATE REQUEST ERROR:", err);
    res.status(500).json({ message: "Failed to submit request" });
  }
});

// ==============================
// 📥 ADMIN GET REQUESTS
// ==============================
router.get("/admin/requests", async (req, res) => {
  try {
    const data = await ServiceRequest.find()
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    res.json(data);
  } catch {
    res.status(500).json({ message: "Failed to fetch requests" });
  }
});

// ==============================
// ✅ APPROVE
// ==============================
router.post("/admin/requests/:id/approve", async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "approved";
    await request.save();

    await Transaction.findOneAndUpdate(
      { requestId: request._id },
      { status: "approved" }
    );

    res.json({ message: "Approved" });

  } catch {
    res.status(500).json({ message: "Approval failed" });
  }
});

// ==============================
// ❌ REJECT
// ==============================
router.post("/admin/requests/:id/reject", async (req, res) => {
  try {
    const request = await ServiceRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = "rejected";
    await request.save();

    await Transaction.findOneAndUpdate(
      { requestId: request._id },
      { status: "rejected" }
    );

    res.json({ message: "Rejected" });

  } catch {
    res.status(500).json({ message: "Rejection failed" });
  }
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

    request.resultSlip = pdf;
    request.status = "completed";

    await request.save();

    await Transaction.findOneAndUpdate(
      { requestId: request._id },
      { status: "success" }
    );

    res.json({ message: "Completed" });

  } catch {
    res.status(500).json({ message: "Upload failed" });
  }
});

// ==============================
// 📝 ADD COMMENT (MULTI ADMIN)
// ==============================
router.post("/admin/requests/:id/comment", async (req, res) => {
  try {
    const { text, by } = req.body;

    const request = await ServiceRequest.findById(req.params.id);

    request.comments.push({ text, by });

    await request.save();

    res.json({ message: "Comment added" });

  } catch {
    res.status(500).json({ message: "Failed to add comment" });
  }
});

// ==============================
// 🧠 SAVE ADMIN NOTE
// ==============================
router.put("/admin/requests/:id/note", async (req, res) => {
  try {
    const { note } = req.body;

    const request = await ServiceRequest.findById(req.params.id);

    request.adminNotes = note;

    await request.save();

    res.json({ message: "Note saved" });

  } catch {
    res.status(500).json({ message: "Failed to save note" });
  }
});

module.exports = router;