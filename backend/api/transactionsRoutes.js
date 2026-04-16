const express = require("express");
const router = express.Router();

const Transaction = require("../models/Transaction");

router.get("/transactions", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const transactions = await Transaction.find({ userId })
      .populate("requestId")
      .sort({ createdAt: -1 });

    res.json(transactions);

  } catch (err) {
    console.error("FETCH TRANSACTIONS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});

module.exports = router;