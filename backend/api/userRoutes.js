const express = require("express");

const User = require("../models/User");
const Transaction = require("../models/Transaction");

const router = express.Router();

// ==============================
// 🔥 GET USER UNITS (MAIN SYSTEM)
// ==============================
router.post("/balance", async (req, res) => {
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      units: user.units || 0,     // ✅ PRIMARY SYSTEM
      balance: user.balance || 0, // optional (legacy)
    });

  } catch (error) {
    console.error("🔥 BALANCE ERROR:", error.message);

    return res.status(500).json({
      error: "Failed to fetch balance",
    });
  }
});

// ==============================
// 📜 GET USER TRANSACTIONS
// ==============================
router.post("/transactions", async (req, res) => {
  const { userId } = req.body;

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID required" });
    }

    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 });

    // 🔥 NORMALIZE RESPONSE FOR FRONTEND
    const formatted = transactions.map(tx => ({
      _id: tx._id,
      type: tx.type,
      nin: tx.nin || null,
      amount: tx.amount || 0,
      units: tx.units || tx.unitsUsed || 0,
      status: tx.status,
      createdAt: tx.createdAt,
    }));

    return res.json(formatted);

  } catch (error) {
    console.error("🔥 TRANSACTION ERROR:", error.message);

    return res.status(500).json({
      error: "Failed to fetch transactions",
    });
  }
});

module.exports = router;