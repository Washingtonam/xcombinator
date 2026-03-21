const express = require("express");
const fs = require("fs");
const router = express.Router();

const dbPath = "./db.json";

// SIMPLE ADMIN CHECK
function isAdmin(req, res, next) {
  const email = req.headers["email"]; // temporary approach

  if (email !== "admin@xcombinator.com") {
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

module.exports = router;