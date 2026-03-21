const express = require("express");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const adminRoutes = require("./routes/adminRoutes");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/admin", adminRoutes);

const API_KEY = "YOUR_API_KEY";

// READ DB
function readDB() {
  return JSON.parse(fs.readFileSync("./db.json", "utf-8"));
}

// WRITE DB
function writeDB(data) {
  fs.writeFileSync("./db.json", JSON.stringify(data, null, 2));
}

// ================= AUTH =================

// REGISTER (bcrypt)
app.post("/api/register", async (req, res) => {
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

// LOGIN (bcrypt)
app.post("/api/login", async (req, res) => {
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

// ================= ADMIN =================

app.get("/admin/users", (req, res) => {
  const db = readDB();

  const users = db.users.map(u => ({
    id: u.id,
    email: u.email,
    balance: u.balance,
  }));

  res.json(users);
});

app.get("/admin/transactions", (req, res) => {
  const db = readDB();
  res.json(db.transactions);
});

// ================= USER =================

// GET BALANCE
app.post("/api/balance", (req, res) => {
  const { userId } = req.body;

  const db = readDB();
  const user = db.users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ balance: user.balance });
});

// GET TRANSACTIONS
app.post("/api/transactions", (req, res) => {
  const { userId } = req.body;

  const db = readDB();

  const userTransactions = (db.transactions || []).filter(
    tx => tx.userId === userId
  );

  res.json(userTransactions);
});

// ================= PRICING =================

app.get("/api/pricing", (req, res) => {
  const db = readDB();
  res.json(db.pricing);
});

// ================= VERIFY NIN =================

app.post("/api/verify-nin", async (req, res) => {
  const { nin, userId } = req.body;

  const db = readDB();
  const user = db.users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  const pricing = db.pricing?.nin;

  if (!pricing) {
    return res.status(500).json({ error: "Pricing not set" });
  }

  const { cost, price } = pricing;
  const profit = price - cost;

  if (user.balance < price) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  try {
    const response = await axios.post(
      "https://ninbvnportal.com.ng/api/nin-verification",
      {
        nin,
        consent: true,
      },
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    const apiData = response.data;

    user.balance -= price;

    const transaction = {
      id: Date.now(),
      type: "NIN",
      nin,
      amount: price,
      cost: cost,
      profit: profit,
      status: "success",
      date: new Date().toISOString(),
      userId: user.id,
    };

    db.transactions.unshift(transaction);
    writeDB(db);

    res.json({
      status: "success",
      data: apiData,
      balance: user.balance,
    });

  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: "Verification failed" });
  }
});

// ================= VERIFY PAYMENT =================

app.post("/api/verify-payment", async (req, res) => {
  const { reference, amount, userId } = req.body;

  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (response.data.data.status === "success") {

      if (response.data.data.amount !== amount * 100) {
        return res.status(400).json({ error: "Amount mismatch" });
      }

      const db = readDB();
      const user = db.users.find(u => u.id === userId);

      if (!user) return res.status(404).json({ error: "User not found" });

      user.balance += Number(amount);

      const transaction = {
        id: Date.now(),
        type: "FUND",
        amount: Number(amount),
        status: "success",
        date: new Date().toISOString(),
        userId: user.id,
      };

      db.transactions.unshift(transaction);
      writeDB(db);

      return res.json({ balance: user.balance });

    } else {
      return res.status(400).json({ error: "Payment not verified" });
    }

  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(500).json({ error: "Verification failed" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});