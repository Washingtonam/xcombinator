const express = require("express");
const axios = require("axios");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { readDB } = require("../utils/jsonDB");

const router = express.Router();

// 🔐 SECURE API KEY
const API_KEY = process.env.NIN_API_KEY;

// ==============================
// 🔍 VERIFY NIN
// ==============================
router.post("/verify-nin", async (req, res) => {
  const { nin, userId } = req.body;

  try {
    // 🔎 VALIDATION
    if (!nin || nin.length !== 11) {
      return res.status(400).json({ error: "Invalid NIN" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    // 👤 GET USER
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 💰 GET PRICING
    const db = readDB();
    const pricing = db?.pricing?.nin;

    if (!pricing) {
      return res.status(500).json({ error: "Pricing not configured" });
    }

    const { cost, price } = pricing;
    const profit = price - cost;

    // ❌ BALANCE CHECK
    if (user.balance < price) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    console.log("🔌 Calling NIN API (checkmyninbvn)...");

    // 🔥 FIXED API CALL
    const apiResponse = await axios.post(
      "https://checkmyninbvn.com.ng/api/nin-verification",
      {
        nin,
        consent: true,
      },
      {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      }
    );

    console.log("📡 API RESPONSE:", apiResponse.data);

    // ✅ SUCCESS CHECK
    const isSuccess =
      apiResponse.data &&
      (
        apiResponse.data.status === "success" ||
        apiResponse.data.data ||
        apiResponse.status === 200
      );

    if (!isSuccess) {
      return res.status(400).json({
        error: "API verification failed",
        details: apiResponse.data,
      });
    }

    // 💰 DEDUCT BALANCE
    user.balance -= price;
    await user.save();

    // 🧾 SAVE TRANSACTION
    await Transaction.create({
      type: "NIN",
      nin,
      amount: price,
      cost,
      profit,
      status: "success",
      userId: user._id,
    });

    return res.json({
      status: "success",
      data: apiResponse.data,
      balance: user.balance,
    });

  } catch (error) {
    console.error("🔥 FULL ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Verification failed",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;