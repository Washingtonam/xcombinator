const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

// ==============================
// 🔐 ADMIN CHECK
// ==============================
function isAdmin(req, res, next) {
  const email = req.headers["email"];

  if (!email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (email !== "washingtonamedu@gmail.com") {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
}

// ==============================
// 📤 USER SUBMITS PAYMENT (PROOF)
// ==============================
router.post("/submit-payment", async (req, res) => {
  try {
    const { userId, amount, proof } = req.body;

    if (!userId || !amount || !proof) {
      return res.status(400).json({
        message: "userId, amount and proof are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🧾 CREATE PENDING TRANSACTION
    const payment = await Transaction.create({
      type: "FUND",
      amount,
      status: "pending",
      userId,
      proof, // 🔥 store image/url
    });

    res.json({
      message: "Payment submitted, awaiting approval",
      payment,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to submit payment" });
  }
});

// ==============================
// 📥 ADMIN GET ALL PAYMENTS
// ==============================
router.get("/admin/payments", isAdmin, async (req, res) => {
  try {
    const payments = await Transaction.find({
      type: "FUND",
    })
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    res.json(payments);

  } catch (error) {
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

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "approved") {
      return res.status(400).json({ message: "Already approved" });
    }

    const user = await User.findById(payment.userId);

    const before = user.balance;

    // 💰 CREDIT USER
    user.balance += payment.amount;
    await user.save();

    // ✅ UPDATE TRANSACTION
    payment.status = "approved";
    await payment.save();

    // 🧾 AUDIT LOG
    await AuditLog.create({
      action: "APPROVE_PAYMENT",
      performedBy: adminEmail,
      userId: user._id,
      amount: payment.amount,
      balanceBefore: before,
      balanceAfter: user.balance,
      note: "Manual payment approved",
    });

    res.json({
      message: "Payment approved & wallet credited",
      balance: user.balance,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Approval failed" });
  }
});

// ==============================
// ❌ REJECT PAYMENT
// ==============================
router.post("/admin/payments/:id/reject", isAdmin, async (req, res) => {
  try {
    const adminEmail = req.headers["email"];

    const payment = await Transaction.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = "rejected";
    await payment.save();

    // 🧾 AUDIT LOG
    await AuditLog.create({
      action: "REJECT_PAYMENT",
      performedBy: adminEmail,
      userId: payment.userId,
      amount: payment.amount,
      note: "Payment rejected",
    });

    res.json({
      message: "Payment rejected",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Rejection failed" });
  }
});

module.exports = router;