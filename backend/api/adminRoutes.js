const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const AuditLog = require("../models/AuditLog");
const Pricing = require("../models/Pricing");

const SUPER_ADMIN_EMAIL = "washingtonamedu@gmail.com";

// ==============================
// 🔐 AUTH MIDDLEWARE
// ==============================
const isAdmin = async (req, res, next) => {
  try {
    const email = req.headers["email"];
    if (!email) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "User not found" });

    if (!["admin", "super_admin"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    req.user = user;
    next();

  } catch {
    res.status(500).json({ message: "Auth failed" });
  }
};

const isSuperAdmin = async (req, res, next) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({ message: "Super admin only" });
  }
  next();
};

// ==============================
// 👥 GET USERS (PAGINATED)
// ==============================
router.get("/users", isAdmin, async (req, res) => {
  try {
    let { page = 1, limit = 20, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const query = search
      ? {
          $or: [
            { email: { $regex: search, $options: "i" } },
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      data: users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// ==============================
// 🔥 MAKE ADMIN (SUPER ADMIN ONLY)
// ==============================
router.put("/user/:id/make-admin", isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.email === SUPER_ADMIN_EMAIL) {
      return res.status(400).json({ message: "Already super admin" });
    }

    user.role = "admin";
    await user.save();

    await AuditLog.create({
      action: "MAKE_ADMIN",
      performedBy: req.user.email,
      userId: user._id,
    });

    res.json({ message: "User promoted to admin" });

  } catch {
    res.status(500).json({ message: "Failed to promote user" });
  }
});

// ==============================
// 🔥 REMOVE ADMIN (SUPER ADMIN ONLY)
// ==============================
router.put("/user/:id/remove-admin", isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.email === SUPER_ADMIN_EMAIL) {
      return res.status(400).json({ message: "Cannot modify super admin" });
    }

    user.role = "user";
    await user.save();

    await AuditLog.create({
      action: "REMOVE_ADMIN",
      performedBy: req.user.email,
      userId: user._id,
    });

    res.json({ message: "Admin removed" });

  } catch {
    res.status(500).json({ message: "Failed to remove admin" });
  }
});

// ==============================
// 🔒 SUSPEND USER
// ==============================
router.put("/user/:id/suspend", isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user.role === "super_admin") {
      return res.status(400).json({ message: "Cannot suspend super admin" });
    }

    user.status = "suspended";
    await user.save();

    await AuditLog.create({
      action: "SUSPEND_USER",
      performedBy: req.user.email,
      userId: user._id,
    });

    res.json({ message: "User suspended" });

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
      performedBy: req.user.email,
      userId: user._id,
    });

    res.json({ message: "User activated" });

  } catch {
    res.status(500).json({ message: "Failed to activate user" });
  }
});

// ==============================
// 🗑 DELETE USER (SUPER ADMIN ONLY)
// ==============================
router.delete("/user/:id", isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user.role === "super_admin") {
      return res.status(400).json({ message: "Cannot delete super admin" });
    }

    await User.findByIdAndDelete(req.params.id);
    await Transaction.deleteMany({ userId: req.params.id });

    await AuditLog.create({
      action: "DELETE_USER",
      performedBy: req.user.email,
      userId: req.params.id,
    });

    res.json({ message: "User deleted" });

  } catch {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

// ==============================
// 🔥 UNIT CONTROL
// ==============================
router.post("/user/:id/units", isAdmin, async (req, res) => {
  try {
    const { units, action } = req.body;

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
      performedBy: req.user.email,
      userId: user._id,
      before,
      after: user.units,
    });

    res.json({ message: "Units updated", units: user.units });

  } catch {
    res.status(500).json({ message: "Error updating units" });
  }
});

// ==============================
// 💰 UPDATE PRICING
// ==============================
router.put("/pricing", isAdmin, async (req, res) => {
  try {
    let pricing = await Pricing.findOne();
    if (!pricing) pricing = new Pricing({});

    Object.assign(pricing.nin, {
      unitPrice: req.body.unitPrice ?? pricing.nin.unitPrice,
      agentPrice: req.body.agentPrice ?? pricing.nin.agentPrice,
      mode: req.body.mode ?? pricing.nin.mode,
    });

    if (req.body.validation) Object.assign(pricing.ninServices.validation, req.body.validation);
    if (req.body.ipe) Object.assign(pricing.ninServices.ipe, req.body.ipe);
    if (req.body.modification) Object.assign(pricing.ninServices.modification, req.body.modification);
    if (req.body.slipPrice !== undefined) pricing.ninServices.slipPrice = req.body.slipPrice;

    await pricing.save();

    res.json({ message: "Pricing updated", pricing });

  } catch {
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