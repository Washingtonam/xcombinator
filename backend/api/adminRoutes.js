const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Transaction = require("../models/Transaction");

// 🔐 ADMIN CHECK
function isAdmin(req, res, next) {
  const email = req.headers["email"];

  if (!email) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (email !== "washingtonamedu@gmail.com") {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
}

//
// 🔥 GET ALL USERS
//
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.json(users);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

//
// 🔥 GET ALL TRANSACTIONS
//
router.get("/transactions", isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 });

    res.json(transactions);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

//
// 🔥 GET SINGLE USER + ACTIVITY
//
router.get("/user/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const transactions = await Transaction.find({
      userId: user._id,
    }).sort({ createdAt: -1 });

    res.json({
      user,
      transactions,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

//
// 🔥 GET SYSTEM STATS (REAL MONEY DATA)
//
router.get("/stats", isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find();

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    transactions.forEach(tx => {
      if (tx.type === "NIN") {
        totalRevenue += tx.amount || 0;
        totalCost += tx.cost || 0;
        totalProfit += tx.profit || 0;
      }
    });

    res.json({
      totalTransactions: transactions.length,
      totalRevenue,
      totalCost,
      totalProfit,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching stats" });
  }
});

module.exports = router;