const express = require("express");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

// 👉 USE ENV LATER (for now keep as is if you want)
const API_KEY = "a1fa8f28dc914dbafcd19fbbc703ee4338a6303fdae3f40a708c71804fe912a8";

// READ DB
function readDB() {
  return JSON.parse(fs.readFileSync("./db.json", "utf-8"));
}

// WRITE DB
function writeDB(data) {
  fs.writeFileSync("./db.json", JSON.stringify(data, null, 2));
}

// GET BALANCE (USER BASED)
app.get("/balance", (req, res) => {
  const db = readDB();
  const user = db.users[0]; // TEMP

  res.json({ balance: user.balance });
});

// GET TRANSACTIONS (USER BASED)
app.get("/transactions", (req, res) => {
  const db = readDB();
  const user = db.users[0];

  const userTransactions = (db.transactions || []).filter(
    (tx) => tx.userId === user.id
  );

  res.json(userTransactions);
});

// VERIFY NIN (USER BASED)
app.post("/verify-nin", async (req, res) => {
  const { nin } = req.body;

  const db = readDB();
  const user = db.users[0];

  if (user.balance < 100) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  try {
    const response = await axios.post(
      "https://ninbvnportal.com.ng/api/nin-verification",
      {
        nin: nin,
        consent: true,
      },
      {
        headers: {
          "x-api-key": API_KEY,
        },
      }
    );

    const apiData = response.data;

    // deduct AFTER success
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

    return res.status(500).json({
      error: "Verification failed",
    });
  }
});

// VERIFY PAYMENT (USER BASED)
app.post("/verify-payment", async (req, res) => {
  const { reference, amount } = req.body;

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

      // 🔐 SECURITY CHECK
      if (response.data.data.amount !== amount * 100) {
        return res.status(400).json({ error: "Amount mismatch" });
      }

      const db = readDB();
      const user = db.users[0];

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