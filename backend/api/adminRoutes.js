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
// 🔍 SEARCH USERS
//
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

//
// 🔥 GET ALL USERS
//
router.get("/users", isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

//
// 🔥 SUSPEND USER
//
router.put("/user/:id/suspend", isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "suspended" },
      { new: true }
    );

    res.json({ message: "User suspended", user });

  } catch (error) {
    res.status(500).json({ message: "Failed to suspend user" });
  }
});

//
// 🔥 ACTIVATE USER
//
router.put("/user/:id/activate", isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true }
    );

    res.json({ message: "User activated", user });

  } catch (error) {
    res.status(500).json({ message: "Failed to activate user" });
  }
});

//
// 🔥 DELETE USER
//
router.delete("/user/:id", isAdmin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    // Optional: also delete transactions
    await Transaction.deleteMany({ userId: req.params.id });

    res.json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
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

    res.json({ user, transactions });

  } catch (error) {
    res.status(500).json({ message: "Error fetching user data" });
  }
});

//
// 📊 ADVANCED STATS (UPGRADED)
//
router.get("/stats", isAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find();

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let ninCount = 0;
    let bvnCount = 0;

    transactions.forEach(tx => {
      totalRevenue += tx.amount || 0;
      totalCost += tx.cost || 0;
      totalProfit += tx.profit || 0;

      if (tx.type === "NIN") ninCount++;
      if (tx.type === "BVN") bvnCount++;
    });

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });
    const suspendedUsers = await User.countDocuments({ status: "suspended" });

    res.json({
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalTransactions: transactions.length,
      totalRevenue,
      totalCost,
      totalProfit,
      ninCount,
      bvnCount,
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

module.exports = router;