const express = require("express");
const axios = require("axios");

const User = require("../models/User");
const Transaction = require("../models/Transaction");

const router = express.Router();

// ==============================
// 💳 VERIFY PAYSTACK PAYMENT
// ==============================
router.post("/verify-payment", async (req, res) => {
  const { reference, amount, userId } = req.body;

  try {
    if (!reference || !userId) {
      return res.status(400).json({ error: "Missing payment details" });
    }

    console.log("🔍 Verifying payment with Paystack...");

    // 🔌 VERIFY PAYMENT WITH PAYSTACK
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const paymentData = response.data.data;

    if (!paymentData || paymentData.status !== "success") {
      return res.status(400).json({ error: "Payment not verified" });
    }

    // 👤 FIND USER (MongoDB)
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 💰 CREDIT USER WALLET
    user.balance += Number(amount);
    await user.save();

    console.log("💰 Wallet updated:", user.balance);

    // 🧾 SAVE TRANSACTION
    await Transaction.create({
      type: "FUND",
      amount: Number(amount),
      status: "success",
      userId: user._id,
    });

    return res.json({
      message: "Payment successful",
      balance: user.balance,
    });

  } catch (error) {
    console.error("🔥 PAYMENT ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Payment verification failed",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;