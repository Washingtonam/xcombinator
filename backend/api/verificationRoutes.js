const express = require("express");
const axios = require("axios");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Pricing = require("../models/Pricing");

const router = express.Router();

const API_KEY = process.env.NIN_API_KEY;
const API_KEY_BACKUP = process.env.NIN_API_KEY_BACKUP;
const ADMIN_EMAIL = "washingtonamedu@gmail.com";

// ==============================
// 🔥 UNIVERSAL VERIFY ROUTE
// ==============================
router.post("/verify", async (req, res) => {
  const { userId, method, data } = req.body;

  try {
    if (!userId || !method) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.status === "suspended") {
      return res.status(403).json({ error: "Account suspended" });
    }

    const isAdmin =
      user.email?.toLowerCase().trim() ===
      ADMIN_EMAIL.toLowerCase().trim();

    const pricing = await Pricing.findOne();
    const mode = pricing?.nin?.mode || "bundle";

    // ==========================
    // 🔥 UNIT LOGIC
    // ==========================
    let unitsRequired = 1;

    if (method === "phone" || method === "demographic") {
      unitsRequired = 2;
    }

    // ==========================
    // 💳 UNIT CHECK
    // ==========================
    if (!isAdmin && user.units < unitsRequired) {
      return res.status(400).json({ error: "Insufficient units" });
    }

    // ==========================
    // 🔥 API CONFIG
    // ==========================
    let url = "";
    let payload = {};

    if (method === "nin") {
      if (!data?.nin || data.nin.length !== 11) {
        return res.status(400).json({ error: "Invalid NIN" });
      }

      url = "https://ninbvnportal.com.ng/api/nin-verification";
      payload = { nin: data.nin, consent: true };
    }

    if (method === "phone") {
      url = "https://checkmyninbvn.com.ng/api/nin-phone";
      payload = {
        phone: data.phone,
        consent: true,
      };
    }

    if (method === "tracking") {
      url = "https://checkmyninbvn.com.ng/api/nin-tracking";
      payload = {
        tracking_id: data.tracking_id,
        consent: true,
      };
    }

    if (method === "demographic") {
      url = "https://checkmyninbvn.com.ng/api/nin-demography";
      payload = {
        firstname: data.firstname,
        lastname: data.lastname,
        gender: data.gender,
        dob: data.dob,
        consent: true,
      };
    }

    if (!url) {
      return res.status(400).json({ error: "Invalid method" });
    }

    // ==========================
    // 🔥 API FAILOVER SYSTEM
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
      console.log("⚠️ PRIMARY FAILED → TRY BACKUP");

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

    // ==========================
    // 🔥 TRANSACTION LOG
    // ==========================
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