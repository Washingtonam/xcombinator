const express = require("express");
const fs = require("fs");
const router = express.Router();

const dbPath = "./db.json";

// ADMIN CHECK (backend authority)
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

// UPDATE PRICING
router.put("/pricing", isAdmin, (req, res) => {
  try {
    const { ninPrice, bvnPrice } = req.body;

    const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

    if (ninPrice !== undefined) {
      db.pricing.nin.price = Number(ninPrice);
    }

    if (bvnPrice !== undefined) {
      db.pricing.bvn.price = Number(bvnPrice);
    }

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    res.json({
      message: "Pricing updated successfully",
      pricing: db.pricing,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/stats", isAdmin, (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync("./db.json", "utf-8"));

    const transactions = db.transactions || [];

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
      totalRevenue,
      totalCost,
      totalProfit,
      totalTransactions: transactions.length,
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

module.exports = router;