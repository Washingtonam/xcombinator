const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const AuditLog = require("../models/AuditLog");
const Pricing = require("../models/Pricing");

// ==============================
// 🔐 ADMIN CHECK
// ==============================
function isAdmin(req, res, next) {
  const email = req.headers["email"];

  if (!email) return res.status(401).json({ message: "Unauthorized" });

  if (email !== "washingtonamedu@gmail.com") {
    return res.status(403).json({ message: "Access denied" });
  }

  next();
}

const ADMIN_EMAIL = "washingtonamedu@gmail.com";

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
  } catch {
    res.status(500).json({ message: "Error fetching users" });
  }
});

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
  } catch {
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
  } catch {
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
  } catch {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// ==============================
// 🔥 UNIT CONTROL (REPLACES WALLET)
// ==============================
router.post("/user/:id/units", isAdmin, async (req, res) => {
  try {
    const { units, action } = req.body;

    if (!units || !action) {
      return res.status(400).json({ message: "Units and action required" });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const before = user.units;

    if (action === "add") user.units += units;

    if (action === "deduct") {
      if (user.units < units) {
        return res.status(400).json({ message: "Insufficient units" });
      }
      user.units -= units;
    }

    await user.save();

    await Transaction.create({
      type: action === "add" ? "UNIT_ADD" : "UNIT_DEDUCT",
      units,
      status: "success",
      userId: user._id,
    });

    await AuditLog.create({
      action: action === "add" ? "ADD_UNITS" : "DEDUCT_UNITS",
      performedBy: req.headers["email"],
      userId: user._id,
      before,
      after: user.units,
    });

    res.json({ message: "Units updated", units: user.units });

  } catch (error) {
    res.status(500).json({ message: "Error updating units" });
  }
});

// ==============================
// 💰 UPDATE PRICING (UNIT SYSTEM)
// ==============================
router.put("/pricing", isAdmin, async (req, res) => {
  try {
    const { unitPrice, agentPrice } = req.body;

    let pricing = await Pricing.findOne();

    if (!pricing) {
      pricing = new Pricing({
        nin: { unitPrice, agentPrice },
      });
    } else {
      pricing.nin.unitPrice = unitPrice;
      pricing.nin.agentPrice = agentPrice;
    }

    await pricing.save();

    res.json({ message: "Pricing updated", pricing });

  } catch (error) {
    res.status(500).json({ message: "Failed to update pricing" });
  }
});

// ==============================
// 📊 TRANSACTIONS
// ==============================
router.get("/transactions", isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch {
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

// ==============================
// 👤 USER DETAILS
// ==============================
router.get("/user/:id", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    const transactions = await Transaction.find({
      userId: user._id,
    }).sort({ createdAt: -1 });

    res.json({ user, transactions });
  } catch {
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
  } catch {
    res.status(500).json({ message: "Failed to fetch audit logs" });
  }
});

module.exports = router;