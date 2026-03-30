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

// ==============================
// 🔍 SEARCH USERS
// ==============================
router.get("/users/search", isAdmin, async (req, res) => {
  const { query } = req.query;

  try {
    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Search failed" });
  }
});

// ==============================
// 🔥 GET ALL USERS
// ==============================
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ==============================
// 🚫 PROTECT ADMIN
// ==============================
const ADMIN_EMAIL = "washingtonamedu@gmail.com";

// ==============================
// 🔥 SUSPEND USER
// ==============================
router.put("/user/:id/suspend", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user.email === ADMIN_EMAIL) {
      return res.status(400).json({ message: "Cannot suspend admin" });
    }

    user.status = "suspended";
    await user.save();

    res.json({ message: "User suspended", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to suspend user" });
  }
});

// ==============================
// 🔥 ACTIVATE USER
// ==============================
router.put("/user/:id/activate", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    user.status = "active";
    await user.save();

    res.json({ message: "User activated", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to activate user" });
  }
});

// ==============================
// 🔥 DELETE USER
// ==============================
router.delete("/user/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user.email === ADMIN_EMAIL) {
      return res.status(400).json({ message: "Cannot delete admin" });
    }

    await User.findByIdAndDelete(req.params.id);
    await Transaction.deleteMany({ userId: req.params.id });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// ==============================
// 💰 WALLET CONTROL (NEW)
// ==============================
router.post("/user/:id/wallet", isAdmin, async (req, res) => {
  try {
    const { amount, action } = req.body;

    if (!amount || !action) {
      return res.status(400).json({ message: "Amount and action required" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let newBalance = user.balance;

    if (action === "add") {
      newBalance += amount;
    }

    if (action === "deduct") {
      if (user.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      newBalance -= amount;
    }

    user.balance = newBalance;
    await user.save();

    // 🧾 LOG TRANSACTION
    await Transaction.create({
      type: action === "add" ? "FUND" : "DEDUCT",
      amount,
      status: "success",
      userId: user._id,
    });

    res.json({
      message: "Wallet updated",
      balance: user.balance,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating wallet" });
  }
});

// ==============================
// 🔥 GET ALL TRANSACTIONS
// ==============================
router.get("/transactions", isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

// ==============================
// 🔥 GET SINGLE USER
// ==============================
router.get("/user/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    const transactions = await Transaction.find({
      userId: user._id,
    }).sort({ createdAt: -1 });

    res.json({ user, transactions });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user data" });
  }
});

// ==============================
// 📊 STATS
// ==============================
router.get("/stats", isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find();

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    transactions.forEach(tx => {
      totalRevenue += tx.amount || 0;
      totalCost += tx.cost || 0;
      totalProfit += tx.profit || 0;
    });

    const totalUsers = await User.countDocuments();

    res.json({
      totalUsers,
      totalTransactions: transactions.length,
      totalRevenue,
      totalCost,
      totalProfit,
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

module.exports = router;