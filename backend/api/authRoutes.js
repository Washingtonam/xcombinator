const express = require("express");
const bcrypt = require("bcryptjs");
const { readDB, writeDB } = require("../utils/db");

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  const { email, password } = req.body;

  const db = readDB();

  const existingUser = db.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now(),
    email,
    password: hashedPassword,
    balance: 0,
  };

  db.users.push(newUser);
  writeDB(db);

  res.json({ message: "User created successfully" });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const db = readDB();
  const user = db.users.find(u => u.email === email);

  if (!user) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return res.status(400).json({ error: "Invalid credentials" });
  }

  res.json({
    message: "Login successful",
    user: {
      id: user.id,
      email: user.email,
    },
  });
});

module.exports = router;