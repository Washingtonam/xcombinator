const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Transaction = require("../models/Transaction");
const AuditLog = require("../models/AuditLog");
const Pricing = require("../models/Pricing");

// ==============================
// 🔐 AUTH MIDDLEWARE (FINAL FIX)
// ==============================
const isAdmin = async (req, res, next) => {
  try {
    const email = req.headers["email"];

    if (!email) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ email }).lean();

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (!["admin", "super_admin"].includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    req.user = user;

    return next(); // ✅ FIX

  } catch (err) {
    console.error("AUTH ERROR:", err);
    return res.status(500).json({ message: "Auth failed" }); // ✅ FIX
  }
};

const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.user.role !== "super_admin") {
    return res.status(403).json({ message: "Super admin only" });
  }

  return next(); // ✅ FIX
};

// ==============================
// 👥 GET USERS
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

    return res.json({
      data: users,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (err) {
    console.error("FETCH USERS ERROR:", err);
    return res.status(500).json({ message: "Error fetching users" });
  }
});

// ==============================
// 🔥 MAKE ADMIN
// ==============================
router.put("/user/:id/make-admin", isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "super_admin") {
      return res.status(400).json({ message: "Cannot modify super admin" });
    }

    user.role = "admin";
    await user.save();

    return res.json({ message: "User promoted to admin", user });

  } catch (err) {
    console.error("MAKE ADMIN ERROR:", err);
    return res.status(500).json({ message: "Failed to promote user" });
  }
});

// ==============================
// 🔥 REMOVE ADMIN
// ==============================
router.put("/user/:id/remove-admin", isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "super_admin") {
      return res.status(400).json({ message: "Cannot modify super admin" });
    }

    user.role = "user";
    await user.save();

    return res.json({ message: "Admin removed", user });

  } catch (err) {
    console.error("REMOVE ADMIN ERROR:", err);
    return res.status(500).json({ message: "Failed to remove admin" });
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

    return res.json({ message: "User suspended" });

  } catch (err) {
    console.error("SUSPEND ERROR:", err);
    return res.status(500).json({ message: "Failed to suspend user" });
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

    return res.json({ message: "User activated" });

  } catch (err) {
    console.error("ACTIVATE ERROR:", err);
    return res.status(500).json({ message: "Failed to activate user" });
  }
});

// ==============================
// 🗑 DELETE USER
// ==============================
router.delete("/user/:id", isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user.role === "super_admin") {
      return res.status(400).json({ message: "Cannot delete super admin" });
    }

    await User.findByIdAndDelete(req.params.id);
    await Transaction.deleteMany({ userId: req.params.id });

    return res.json({ message: "User deleted" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    return res.status(500).json({ message: "Failed to delete user" });
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

    if (action === "add") user.units += units;

    if (action === "deduct") {
      if (user.units < units) {
        return res.status(400).json({ message: "Insufficient units" });
      }
      user.units -= units;
    }

    await user.save();

    return res.json({ message: "Units updated", units: user.units });

  } catch (err) {
    console.error("UNITS ERROR:", err);
    return res.status(500).json({ message: "Error updating units" });
  }
});

module.exports = router;