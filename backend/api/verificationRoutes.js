const express = require("express");
const axios = require("axios");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { readDB } = require("../utils/jsonDB");

const router = express.Router();

const API_KEY = process.env.NIN_API_KEY;

// ==============================
// 🔥 MOCK DATA (TEST MODE)
// ==============================
const mockData = {
  firstname: "JOHN",
  middlename: "DOE",
  surname: "TEST",
  nin: "00000000000",
  birthdate: "1995-01-01",
  gender: "Male",
  telephoneno: "08000000000",
  residence_address: "Test Address, Lagos",
  residence_state: "Lagos",
  residence_lga: "Ikeja",
  photo: null,
};

// ==============================
// 🔍 VERIFY NIN
// ==============================
router.post("/verify-nin", async (req, res) => {
  const { nin, userId } = req.body;

  try {
    // ==========================
    // VALIDATION
    // ==========================
    if (!nin || nin.length !== 11) {
      return res.status(400).json({ error: "Invalid NIN" });
    }

    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "Account suspended" });
    }

    const isAdmin = user.email === "washingtonamedu@gmail.com";

    // ==========================
    // 🧪 MOCK MODE (FREE)
    // ==========================
    if (nin === "00000000000") {
      console.log("🧪 MOCK MODE ACTIVE");

      return res.json({
        status: "success",
        data: mockData,
        balance: user.balance,
      });
    }

    // ==========================
    // 💰 PRICING
    // ==========================
    const db = readDB();
    const pricing = db?.pricing?.nin;

    if (!pricing || !pricing.data) {
      return res.status(500).json({ error: "Pricing not configured" });
    }

    const price = pricing.data;
    const cost = 0;
    const profit = price;

    // ==========================
    // 💳 BALANCE CHECK (NON-ADMIN ONLY)
    // ==========================
    if (!isAdmin && user.balance < price) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // ==========================
    // 🔌 API CALL
    // ==========================
    if (!API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    console.log("🔌 Calling NIN API...");

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

    if (apiData.status !== "success") {
      return res.status(400).json({
        error: "API verification failed",
        details: apiData,
      });
    }

    const cleanData = apiData.data?.data || apiData.data;

    // ==========================
    // 💰 DEDUCT (NON-ADMIN ONLY)
    // ==========================
    if (!isAdmin) {
      user.balance -= price;
      await user.save();
    }

    // ==========================
    // 🧾 SAVE TRANSACTION (OPTIONAL FOR ADMIN)
    // ==========================
    if (!isAdmin) {
      await Transaction.create({
        type: "NIN",
        nin,
        amount: price,
        cost,
        profit,
        status: "success",
        userId: user._id,
      });
    }

    // ==========================
    // ✅ RESPONSE
    // ==========================
    return res.json({
      status: "success",
      data: cleanData,
      balance: user.balance,
    });

  } catch (error) {
    console.error("🔥 ERROR:", error.response?.data || error.message);

    return res.status(500).json({
      error: "Verification failed",
      details: error.response?.data || error.message,
    });
  }
});

module.exports = router;