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

  if (!email) return res.status(401).json({ message: "Unauthorized" });
  if (email !== "washingtonamedu@gmail.com")
    return res.status(403).json({ message: "Access denied" });

  next();
}

// ==============================
// 📤 USER SUBMITS PAYMENT
// ==============================
router.post("/submit-payment", async (req, res) => {
  try {
    const { userId, amount, proof } = req.body;

    if (!userId || !amount || !proof) {
      return res.status(400).json({
        message: "userId, amount and proof required",
      });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 🚫 BLOCK DUPLICATE PENDING PAYMENTS
    const existingPending = await Transaction.findOne({
      userId,
      type: "FUND",
      status: "pending",
    });

    if (existingPending) {
      return res.status(400).json({
        message: "You already have a pending payment awaiting approval",
      });
    }

    const payment = await Transaction.create({
      type: "FUND",
      amount,
      status: "pending",
      userId,
      proof,
    });

    res.json({
      message: "Payment submitted successfully",
      payment,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Submission failed" });
  }
});

// ==============================
// 📥 ADMIN GET PAYMENTS
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
// ✅ APPROVE
// ==============================
router.post("/admin/payments/:id/approve", isAdmin, async (req, res) => {
  try {
    const adminEmail = req.headers["email"];

    const payment = await Transaction.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: "Not found" });

    if (payment.status === "approved") {
      return res.status(400).json({ message: "Already approved" });
    }

    const user = await User.findById(payment.userId);

    const before = user.balance;

    user.balance += payment.amount;
    await user.save();

    payment.status = "approved";
    await payment.save();

    await AuditLog.create({
      action: "APPROVE_PAYMENT",
      performedBy: adminEmail,
      userId: user._id,
      amount: payment.amount,
      balanceBefore: before,
      balanceAfter: user.balance,
    });

    res.json({ message: "Approved & wallet credited" });

  } catch (error) {
    res.status(500).json({ message: "Approval failed" });
  }
});

// ==============================
// ❌ REJECT
// ==============================
router.post("/admin/payments/:id/reject", isAdmin, async (req, res) => {
  try {
    const payment = await Transaction.findById(req.params.id);

    payment.status = "rejected";
    await payment.save();

    res.json({ message: "Payment rejected" });

  } catch (error) {
    res.status(500).json({ message: "Rejection failed" });
  }
});

module.exports = router;