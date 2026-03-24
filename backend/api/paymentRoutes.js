const express = require("express");
const axios = require("axios");
const User = require("../models/User");
const Transaction = require("../models/Transaction");

const router = express.Router();

router.post("/verify-payment", async (req, res) => {
  const { reference, amount, userId } = req.body;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.sk_test_d0a4f4bc436c1be437efdd87ae924b363ceb3880}`,
        },
      }
    );

    if (response.data.data.status === "success") {
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.balance += Number(amount);
      await user.save();

      // ✅ SAVE TRANSACTION (MONGODB)
      await Transaction.create({
        type: "FUND",
        amount: Number(amount),
        userId: user._id,
        status: "success",
      });

      return res.json({ balance: user.balance });
    }

    res.status(400).json({ error: "Payment not verified" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Verification failed" });
  }
});

module.exports = router;