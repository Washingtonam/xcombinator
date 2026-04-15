const express = require("express");
const axios = require("axios");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Pricing = require("../models/Pricing");

const router = express.Router();

const API_KEY = process.env.NIN_API_KEY;
const API_KEY_BACKUP = process.env.NIN_API_KEY_BACKUP;
const ADMIN_EMAIL = "washingtonamedu@gmail.com";

// ✅ MOCK (CRITICAL FOR TESTING)
const mockData = {
  firstname: "JOHN",
  middlename: "DOE",
  surname: "TEST",
  nin: "00000000000",
  birthdate: "1995-01-01",
  gender: "Male",
  telephoneno: "08000000000",
  residence_address: "Test Address, Lagos",
};

// ==============================
// 🔥 UNIVERSAL VERIFY ROUTE
// ==============================
router.post("/verify", async (req, res) => {
  const { userId, method, nin, phone, tracking_id, firstname, surname, gender, birthdate } = req.body;

  try {
    if (!userId || !method) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isAdmin =
      user.email?.toLowerCase().trim() ===
      ADMIN_EMAIL.toLowerCase().trim();

    const pricing = await Pricing.getPricing();
    const mode = pricing?.nin?.mode || "bundle";

    // ==========================
    // 🔥 MOCK TEST (ALWAYS WORKS)
    // ==========================
    if (nin === "00000000000") {
      if (!isAdmin && user.units < 1) {
        return res.status(400).json({ error: "Insufficient units" });
      }

      if (!isAdmin) {
        user.units -= 1;
        await user.save();
      }

      await Transaction.create({
        type: "NIN",
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
    // 🔥 UNIT LOGIC
    // ==========================
    let unitsRequired = 1;

    if (method === "phone" || method === "demographic") {
      unitsRequired = 2;
    }

    if (!isAdmin && user.units < unitsRequired) {
      return res.status(400).json({ error: "Insufficient units" });
    }

    // ==========================
    // 🔥 ENDPOINT SWITCH
    // ==========================
    let url = "";
    let payload = {};

    if (method === "nin") {
      url = "https://ninbvnportal.com.ng/api/nin-verification";
      payload = { nin, consent: true };
    }

    else if (method === "phone") {
      url = "https://checkmyninbvn.com.ng/api/nin-phone";
      payload = { phone, consent: true };
    }

    else if (method === "tracking") {
      url = "https://checkmyninbvn.com.ng/api/nin-tracking";
      payload = { tracking_id, consent: true };
    }

    else if (method === "demographic") {
      url = "https://checkmyninbvn.com.ng/api/nin-demography";
      payload = {
        firstname,
        lastname: surname,
        gender,
        dob: birthdate,
        consent: true,
      };
    }

    else {
      return res.status(400).json({ error: "Invalid method" });
    }

    // ==========================
    // 🔥 API FAILOVER
    // ==========================
    let apiData;

    try {
      const primary = await axios.post(url, payload, {
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      });

      apiData = primary.data;
      console.log("✅ PRIMARY USED");

    } catch (err) {
      console.log("⚠️ PRIMARY FAILED → BACKUP");

      try {
        const backup = await axios.post(url, payload, {
          headers: {
            "x-api-key": API_KEY_BACKUP,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        });

        apiData = backup.data;
        console.log("✅ BACKUP USED");

      } catch (backupErr) {
        console.error("❌ BOTH APIs FAILED");
        return res.status(500).json({
          error: "Verification service unavailable",
        });
      }
    }

    const cleanData = apiData?.data?.data || apiData?.data || apiData;

    // ==========================
    // 🔥 DEDUCT UNITS
    // ==========================
    if (!isAdmin) {
      user.units -= unitsRequired;
      await user.save();
    }

    await Transaction.create({
      type: "NIN",
      unitsUsed: isAdmin ? 0 : unitsRequired,
      userId: user._id,
      status: "success",
    });

    return res.json({
      status: "success",
      data: cleanData,
      unitsUsed: unitsRequired,
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