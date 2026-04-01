const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const AuditLog = require("../models/AuditLog");
const { readDB, writeDB } = require("../utils/jsonDB");

// ==============================
// 🔐 ADMIN CHECK
// ==============================
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
  try {
    const { query } = req.query;

    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: "i" } },
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
      ],
    }).select("-password");

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Search failed" });
  }
});

// ==============================
// 👥 GET ALL USERS
// ==============================
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ==============================
// 🚫 PROTECT ADMIN
// ==============================
const ADMIN_EMAIL = "washingtonamedu@gmail.com";

// ==============================
// 🔒 SUSPEND USER
// ==============================
router.put("/user/:id/suspend", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user.email === ADMIN_EMAIL) {
      return res.status(400).json({ message: "Cannot suspend admin" });
    }

    user.status = "suspended";
    await user.save();

    await AuditLog.create({
      action: "SUSPEND_USER",
      performedBy: req.headers["email"],
      userId: user._id,
    });

    res.json({ message: "User suspended", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to suspend user" });
  }
});

// ==============================
// ✅ ACTIVATE USER
// ==============================
router.put("/user/:id/activate", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    user.status = "active";
    await user.save();

    await AuditLog.create({
      action: "ACTIVATE_USER",
      performedBy: req.headers["email"],
      userId: user._id,
    });

    res.json({ message: "User activated", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to activate user" });
  }
});

// ==============================
// 🗑 DELETE USER
// ==============================
router.delete("/user/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user.email === ADMIN_EMAIL) {
      return res.status(400).json({ message: "Cannot delete admin" });
    }

    await User.findByIdAndDelete(req.params.id);
    await Transaction.deleteMany({ userId: req.params.id });

    await AuditLog.create({
      action: "DELETE_USER",
      performedBy: req.headers["email"],
      userId: req.params.id,
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// ==============================
// 💰 WALLET CONTROL
// ==============================
router.post("/user/:id/wallet", isAdmin, async (req, res) => {
  try {
    const { amount, action } = req.body;

    if (!amount || !action) {
      return res.status(400).json({ message: "Amount and action required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const before = user.balance;

    if (action === "add") user.balance += amount;

    if (action === "deduct") {
      if (user.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      user.balance -= amount;
    }

    await user.save();

    await Transaction.create({
      type: action === "add" ? "FUND" : "DEDUCT",
      amount,
      status: "success",
      userId: user._id,
    });

    await AuditLog.create({
      action: action === "add" ? "ADD_FUNDS" : "DEDUCT_FUNDS",
      performedBy: req.headers["email"],
      userId: user._id,
      amount,
      balanceBefore: before,
      balanceAfter: user.balance,
    });

    res.json({ message: "Wallet updated", balance: user.balance });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating wallet" });
  }
});

// ==============================
// 💰 UPDATE NIN SLIP PRICING
// ==============================
router.put("/pricing", isAdmin, async (req, res) => {
  try {
    const { dataPrice, premiumPrice, longPrice } = req.body;

    if (
      dataPrice === undefined ||
      premiumPrice === undefined ||
      longPrice === undefined
    ) {
      return res.status(400).json({
        message: "All pricing fields are required",
      });
    }

    const db = readDB();

    if (!db.pricing) db.pricing = {};
    if (!db.pricing.nin) db.pricing.nin = {};

    db.pricing.nin.data = Number(dataPrice);
    db.pricing.nin.premium = Number(premiumPrice);
    db.pricing.nin.long = Number(longPrice);

    writeDB(db);

    res.json({
      message: "Pricing updated successfully",
      pricing: db.pricing.nin,
    });

  } catch (error) {
    console.error("PRICING ERROR:", error);
    res.status(500).json({
      message: "Failed to update pricing",
      error: error.message,
    });
  }
});

// ==============================
// 📊 GET TRANSACTIONS
// ==============================
router.get("/transactions", isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

// ==============================
// 👤 GET SINGLE USER
// ==============================
router.get("/user/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    const transactions = await Transaction.find({
      userId: user._id,
    }).sort({ createdAt: -1 });

    res.json({ user, transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching user data" });
  }
});

// ==============================
// 📜 AUDIT LOGS
// ==============================
router.get("/audit-logs", isAdmin, async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate("userId", "email")
      .sort({ createdAt: -1 });

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

module.exports = router;