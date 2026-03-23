const express = require("express");
const axios = require("axios");
const { readDB, writeDB } = require("../utils/db");

const router = express.Router();

const API_KEY = "YOUR_API_KEY";

// VERIFY NIN
router.post("/verify-nin", async (req, res) => {
  const { nin, userId } = req.body;

  const db = readDB();
  const user = db.users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  const pricing = db.pricing?.nin;
  const { cost, price } = pricing;
  const profit = price - cost;

  if (user.balance < price) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  try {
    const response = await axios.post(
      "https://ninbvnportal.com.ng/api/nin-verification",
      { nin, consent: true },
      {
        headers: { "x-api-key": API_KEY },
      }
    );

    user.balance -= price;

    db.transactions.unshift({
      id: Date.now(),
      type: "NIN",
      nin,
      amount: price,
      cost,
      profit,
      status: "success",
      date: new Date().toISOString(),
      userId,
    });

    writeDB(db);

    res.json({
      status: "success",
      data: response.data,
      balance: user.balance,
    });

  } catch (error) {
    return res.status(500).json({ error: "Verification failed" });
  }
});

module.exports = router;