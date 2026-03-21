const express = require("express");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = "YOUR_API_KEY";

// READ DB
function readDB() {
  return JSON.parse(fs.readFileSync("./db.json", "utf-8"));
}

// WRITE DB
function writeDB(data) {
  fs.writeFileSync("./db.json", JSON.stringify(data, null, 2));
}

// GET BALANCE (NOW POST + USER ID)
app.post("/balance", (req, res) => {
  const { userId } = req.body;

  const db = readDB();
  const user = db.users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ balance: user.balance });
});

// GET TRANSACTIONS (NOW POST + USER ID)
app.post("/transactions", (req, res) => {
  const { userId } = req.body;

  const db = readDB();

  const userTransactions = (db.transactions || []).filter(
    tx => tx.userId === userId
  );

  res.json(userTransactions);
});

// VERIFY NIN
app.post("/verify-nin", async (req, res) => {
  const { nin, userId } = req.body;

  const db = readDB();
  const user = db.users.find(u => u.id === userId);

  if (!user) return res.status(404).json({ error: "User not found" });

  if (user.balance < 100) {
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

    user.balance -= 100;

    const transaction = {
      id: Date.now(),
      type: "NIN",
      nin,
      amount: 100,
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

// VERIFY PAYMENT
app.post("/verify-payment", async (req, res) => {
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

// REGISTER
app.post("/register", (req, res) => {
  const { email, password } = req.body;

  const db = readDB();

  const existingUser = db.users.find(u => u.email === email);

  if (existingUser) {
    return res.status(400).json({ error: "User already exists" });
  }

  const newUser = {
    id: Date.now(),
    email,
    password,
    balance: 0,
  };

  db.users.push(newUser);
  writeDB(db);

  res.json({ message: "User created successfully" });
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const db = readDB();

  const user = db.users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});