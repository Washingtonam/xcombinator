const express = require("express");
const axios = require("axios");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Pricing = require("../models/Pricing");

const router = express.Router();

const API_KEY = process.env.NIN_API_KEY;
const API_KEY_BACKUP = process.env.NIN_API_KEY_BACKUP;
const ADMIN_EMAIL = "washingtonamedu@gmail.com";

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

    const isAdmin =
      user.email?.toLowerCase().trim() ===
      ADMIN_EMAIL.toLowerCase().trim();

    const pricing = await Pricing.findOne();
    const mode = pricing?.nin?.mode || "bundle";

    // ==========================
    // 🧪 MOCK MODE (ALWAYS WORKS)
    // ==========================
    if (nin === "00000000000") {
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
    // 💳 UNIT CHECK
    // ==========================
    if (!isAdmin && user.units < 1) {
      return res.status(400).json({ error: "Insufficient units" });
    }

    // ==========================
    // 🔥 API FAILOVER SYSTEM
    // ==========================
    let apiData;

    try {
      const primary = await axios.post(
        "https://ninbvnportal.com.ng/api/nin-verification",
        { nin, consent: true },
        {
          headers: {
            "x-api-key": API_KEY,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      if (primary.data.status === "success") {
        apiData = primary.data;
        console.log("✅ PRIMARY API USED");
      } else {
        throw new Error("Primary failed");
      }

    } catch (primaryError) {
      console.log("⚠️ PRIMARY FAILED → SWITCHING TO BACKUP");

      try {
        const backup = await axios.post(
          "https://ninbvnportal.com.ng/api/nin-verification",
          { nin, consent: true },
          {
            headers: {
              "x-api-key": API_KEY_BACKUP,
              "Content-Type": "application/json",
            },
            timeout: 15000,
          }
        );

        if (backup.data.status === "success") {
          apiData = backup.data;
          console.log("✅ BACKUP API USED");
        } else {
          throw new Error("Backup failed");
        }

      } catch (backupError) {
        console.error("❌ BOTH APIs FAILED");

        return res.status(500).json({
          error: "Verification service unavailable. Try again later.",
        });
      }
    }

    const cleanData = apiData.data?.data || apiData.data;

    // ==========================
    // 🔥 DEDUCT UNIT
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