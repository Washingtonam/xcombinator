const express = require("express");
const router = express.Router();

// 🔥 SAFE IMPORT (PREVENTS .find ERROR)
const Transaction = require("../models/Transaction");

const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Pricing = require("../models/Pricing");

// ==============================
// 🔐 ADMIN CHECK
// ==============================
function isAdmin(req, res, next) {
  const email = req.headers["email"];

  if (!email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (email.toLowerCase().trim() !== "washingtonamedu@gmail.com") {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
}

// ==============================
// 📤 USER SUBMITS PAYMENT
// ==============================
router.post("/submit-payment", async (req, res) => {
  try {
    const { userId, amount, proof, units } = req.body;

    if (!userId || !amount || !proof) {
      return res.status(400).json({
        message: "userId, amount and proof required",
      });
    }

    if (proof.length > 5 * 1024 * 1024) {
      return res.status(400).json({
        message: "Image too large. Reduce file size.",
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🔥 BLOCK MULTIPLE PENDING
    const existingPending = await Transaction.findOne({
      userId,
      type: "UNIT_ADD",
      status: "pending",
    });

    if (existingPending) {
      return res.status(400).json({
        message: "You already have a pending payment",
      });
    }

    const payment = await Transaction.create({
      type: "UNIT_ADD",
      amount,
      units: units || 0,
      status: "pending",
      userId,
      proof,
    });

    res.json({
      message: "Payment submitted successfully",
      payment,
    });

  } catch (error) {
    console.error("🔥 SUBMIT ERROR:", error);
    res.status(500).json({
      message: "Submission failed",
      error: error.message,
    });
  }
});

// ==============================
// 📥 ADMIN GET PAYMENTS
// ==============================
router.get("/admin/payments", isAdmin, async (req, res) => {
  try {
    const payments = await Transaction.find({
      type: "UNIT_ADD",
    })
      .populate("userId", "email units")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    console.error("🔥 FETCH PAYMENTS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch payments" });
  }
});

// ==============================
// ✅ APPROVE PAYMENT
// ==============================
router.post("/admin/payments/:id/approve", isAdmin, async (req, res) => {
  try {
    const adminEmail = req.headers["email"];

    const payment = await Transaction.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Not found" });

    // 🔥 GUARD: ONLY PENDING CAN BE APPROVED
    if (payment.status !== "pending") {
      return res.status(400).json({
        message: `Cannot approve a ${payment.status} payment`,
      });
    }

    const user = await User.findById(payment.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const pricing = await Pricing.findOne();
    const pricePerUnit = pricing?.nin?.unitPrice || 250;

    let unitsToAdd = payment.units;

    if (!unitsToAdd || unitsToAdd < 1) {
      unitsToAdd = Math.floor(payment.amount / pricePerUnit);
    }

    if (unitsToAdd < 1) {
      return res.status(400).json({
        message: "Amount too small to generate units",
      });
    }

    const beforeUnits = user.units;

    user.units += unitsToAdd;
    await user.save();

    payment.status = "approved";
    payment.units = unitsToAdd;
    await payment.save();

    await AuditLog.create({
      action: "APPROVE_PAYMENT",
      performedBy: adminEmail,
      userId: user._id,
      amount: payment.amount,
      unitsAdded: unitsToAdd,
      unitsBefore: beforeUnits,
      unitsAfter: user.units,
    });

    res.json({
      message: `Approved. ${unitsToAdd} units added`,
      units: user.units,
    });

  } catch (error) {
    console.error("🔥 APPROVAL ERROR:", error);
    res.status(500).json({
      message: "Approval failed",
      error: error.message,
    });
  }
});

// ==============================
// ❌ REJECT
// ==============================
router.post("/admin/payments/:id/reject", isAdmin, async (req, res) => {
  try {
    const payment = await Transaction.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Not found" });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({
        message: `Cannot reject a ${payment.status} payment`,
      });
    }

    payment.status = "rejected";
    await payment.save();

    res.json({ message: "Payment rejected" });

  } catch (error) {
    console.error("🔥 REJECT ERROR:", error);
    res.status(500).json({ message: "Rejection failed" });
  }
});

module.exports = router;