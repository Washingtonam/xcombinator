const express = require("express");
const axios = require("axios");
const { readDB, writeDB } = require("../utils/db");

const router = express.Router();

router.post("/verify-payment", async (req, res) => {
  const { reference, amount, userId } = req.body;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.data.status === "success") {
      const db = readDB();
      const user = db.users.find(u => u.id === userId);

      if (!user) return res.status(404).json({ error: "User not found" });

      user.balance += Number(amount);

      db.transactions.unshift({
        id: Date.now(),
        type: "FUND",
        amount: Number(amount),
        status: "success",
        date: new Date().toISOString(),
        userId,
      });

      writeDB(db);

      return res.json({ balance: user.balance });
    }

    res.status(400).json({ error: "Payment not verified" });

  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
});

module.exports = router;