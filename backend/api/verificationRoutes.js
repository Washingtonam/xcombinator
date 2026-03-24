const express = require("express");
const axios = require("axios");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { readDB } = require("../utils/jsonDB"); // for pricing only

const router = express.Router();

// 🔐 SECURE API KEY (from Render env)
const API_KEY = process.env.NIN_API_KEY;

// ==============================
// 🔍 VERIFY NIN
// ==============================
router.post("/verify-nin", async (req, res) => {
  const { nin, userId } = req.body;

  try {
    // ✅ Validate input
    if (!nin || nin.length !== 11) {
      return res.status(400).json({ error: "Invalid NIN" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    // 👤 Get user from MongoDB
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 💰 Get pricing (still from JSON for now)
    const db = readDB();
    const pricing = db?.pricing?.nin;

    if (!pricing) {
      return res.status(500).json({ error: "Pricing not configured" });
    }

    const { cost, price } = pricing;
    const profit = price - cost;

    // ❌ Check balance
    if (user.balance < price) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // 🔌 CALL NIN API
    const apiResponse = await axios.post(
      "https://ninbvnportal.com.ng/api/nin-verification",
      {
        nin: nin,
        consent: true,
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    // ⚠️ Validate API response
    if (!apiResponse.data || apiResponse.data.status !== "success") {
      return res.status(400).json({
        error: "API verification failed",
        details: apiResponse.data,
      });
    }

    // 💰 Deduct ONLY after success
    user.balance -= price;
    await user.save();

    // 🧾 Save transaction
    await Transaction.create({
      type: "NIN",
      nin,
      amount: price,
      cost,
      profit,
      status: "success",
      userId: user._id,
    });

    // ✅ Return success
    return res.json({
      status: "success",
      data: apiResponse.data,
      balance: user.balance,
    });

  } catch (error) {
    console.error("🔥 NIN API ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Verification failed",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;