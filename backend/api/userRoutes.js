const express = require("express");
const { readDB } = require("../utils/db");

const router = express.Router();

// GET BALANCE
router.post("/balance", (req, res) => {
  const { userId } = req.body;

  const db = readDB();
  const user = db.users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ balance: user.balance });
});

// GET TRANSACTIONS
router.post("/transactions", (req, res) => {
  const { userId } = req.body;

  const db = readDB();
  const userTransactions = (db.transactions || []).filter(
    tx => tx.userId === userId
  );

  res.json(userTransactions);
});

module.exports = router;