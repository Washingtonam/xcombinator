const express = require("express");
const axios = require("axios");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Pricing = require("../models/Pricing");

const router = express.Router();

const API_KEY = process.env.NIN_API_KEY;
const ADMIN_EMAIL = "washingtonamedu@gmail.com"; // 🔥 MAKE SURE THIS IS CORRECT

// MOCK DATA
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

router.post("/verify-nin", async (req, res) => {
  const { nin, userId } = req.body;

  try {
    // ==========================
    // VALIDATION
    // ==========================
    if (!nin || nin.length !== 11) {
      return res.status(400).json({ error: "Invalid NIN" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.status === "suspended") {
      return res.status(403).json({ error: "Account suspended" });
    }

    const isAdmin = user.email === ADMIN_EMAIL;

    // 🔥 GET MODE
    const pricing = await Pricing.findOne();
    const mode = pricing?.nin?.mode || "bundle";

    // ==========================
    // 🧪 MOCK MODE
    // ==========================
    if (nin === "00000000000") {

      // ❌ NO UNIT DEDUCTION FOR ADMIN
      if (!isAdmin) {
        if (user.units < 1) {
          return res.status(400).json({ error: "Insufficient units" });
        }

        user.units -= 1;
        await user.save();
      }

      await Transaction.create({
        type: "NIN",
        nin,
        unitsUsed: isAdmin ? 0 : 1,
        status: "success",
        userId: user._id,
      });

      return res.json({
        status: "success",
        data: mockData,
        units: user.units,
        mode,
      });
    }

    // ==========================
    // 💳 UNIT CHECK (REAL API)
    // ==========================
    if (!isAdmin && user.units < 1) {
      return res.status(400).json({ error: "Insufficient units" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "API key not configured" });
    }

    const apiResponse = await axios.post(
      "https://ninbvnportal.com.ng/api/nin-verification",
      { nin, consent: true },
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
      return res.status(400).json({ error: "API failed" });
    }

    const cleanData = apiData.data?.data || apiData.data;

    // ==========================
    // 🔥 DEDUCT UNIT (ONLY USERS)
    // ==========================
    if (!isAdmin) {
      user.units -= 1;
      await user.save();
    }

    await Transaction.create({
      type: "NIN",
      nin,
      unitsUsed: isAdmin ? 0 : 1,
      status: "success",
      userId: user._id,
    });

    return res.json({
      status: "success",
      data: cleanData,
      units: user.units,
      mode,
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error.message);
    return res.status(500).json({
      error: "Verification failed",
      details: error.message,
    });
  }
});

module.exports = router;