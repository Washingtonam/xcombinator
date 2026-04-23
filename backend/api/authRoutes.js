const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();

// ==============================
// 🔐 REGISTER
// ==============================
router.post("/register", async (req, res) => {
  try {
    let { firstName, lastName, nin, email, password } = req.body;

    // ==========================
    // VALIDATION
    // ==========================
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    email = email.toLowerCase().trim();

    // ==========================
    // CHECK EXISTING USER
    // ==========================
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // ==========================
    // HASH PASSWORD
    // ==========================
    const hashedPassword = await bcrypt.hash(password, 10);

    // ==========================
    // CREATE USER
    // ==========================
    const newUser = await User.create({
      firstName: firstName || "",
      lastName: lastName || "",
      nin: nin || "",
      email,
      password: hashedPassword,
      units: 0,
      balance: 0,
      status: "active",
    });

    res.json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        units: newUser.units || 0,
        role: newUser.role, // ✅ USE ROLE
      },
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      error: error.message || "Registration failed",
    });
  }
});

// ==============================
// 🔐 LOGIN
// ==============================
router.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;

    // ==========================
    // VALIDATION
    // ==========================
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password required",
      });
    }

    email = email.toLowerCase().trim();

    // ==========================
    // FIND USER
    // ==========================
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // ==========================
    // CHECK PASSWORD
    // ==========================
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // ==========================
    // CHECK STATUS
    // ==========================
    if (user.status === "suspended") {
      return res.status(403).json({ error: "Account suspended" });
    }

    // ==========================
    // UPDATE LAST LOGIN (🔥 NEW)
    // ==========================
    user.lastLogin = new Date();
    await user.save();

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        units: user.units || 0,
        role: user.role, // ✅ USE ROLE
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      error: error.message || "Login failed",
    });
  }
});

module.exports = router;