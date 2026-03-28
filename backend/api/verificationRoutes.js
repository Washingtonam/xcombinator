const express = require("express");
const axios = require("axios");
const { generateNINSlip } = require("../utils/pdfGenerator");



const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { readDB } = require("../utils/jsonDB");

const router = express.Router();

const API_KEY = process.env.NIN_API_KEY;

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

    // 💰 PRICING
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

    console.log("🔌 Calling NIN API...");

    // 🔌 API CALL
    const apiResponse = await axios.post(
      "https://ninbvnportal.com.ng/api/nin-verification",
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

    const apiData = apiResponse.data;

    console.log("📡 RAW API RESPONSE:", apiData);

    // ❌ FAILURE CHECK
    if (apiData.status !== "success") {
      return res.status(400).json({
        error: "API verification failed",
        details: apiData,
      });
    }

    // 🔥 NORMALIZE DATA (CRITICAL FIX)
    const cleanData = apiData.data?.data || apiData.data;

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

    // ✅ FINAL RESPONSE
    return res.json({
      status: "success",
      data: cleanData,
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

router.post("/generate-nin-slip", async (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({ error: "No data provided" });
    }

    const pdfBuffer = await generateNINSlip(data);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=nin-slip.pdf",
    });

    return res.send(pdfBuffer);

  } catch (error) {
    console.error("PDF ERROR:", error);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});


module.exports = router;