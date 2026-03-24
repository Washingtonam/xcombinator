const express = require("express");
const axios = require("axios");

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const { readDB } = require("../utils/jsonDB"); // for pricing only

const router = express.Router();

const API_KEY = "a1fa8f28dc914dbafcd19fbbc703ee4338a6303fdae3f40a708c71804fe912a8";

// VERIFY NIN
router.post("/verify-nin", async (req, res) => {
  const { nin, userId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 🔥 GET PRICING (still from JSON for now)
    const db = readDB();
    const pricing = db.pricing?.nin;

    const { cost, price } = pricing;
    const profit = price - cost;

    if (user.balance < price) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // 🔌 CALL API
    const response = await axios.post(
      "https://ninbvnportal.com.ng/api/nin-verification",
      { nin, consent: true },
      {
        headers: { "x-api-key": API_KEY },
      }
    );

    // 💰 DEDUCT BALANCE
    user.balance -= price;
    await user.save();

    // 🧾 SAVE TRANSACTION (MONGODB)
    await Transaction.create({
      type: "NIN",
      nin,
      amount: price,
      cost,
      profit,
      status: "success",
      userId: user._id,
    });

    res.json({
      status: "success",
      data: response.data,
      balance: user.balance,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Verification failed" });
  }
});

module.exports = router;