const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// READ DB
function readDB() {
  return JSON.parse(fs.readFileSync("./db.json", "utf-8"));
}

// WRITE DB
function writeDB(data) {
  fs.writeFileSync("./db.json", JSON.stringify(data, null, 2));
}

// GET BALANCE
app.get("/balance", (req, res) => {
  const db = readDB();
  res.json({ balance: db.balance });
});

// GET TRANSACTIONS
app.get("/transactions", (req, res) => {
  const db = readDB();
  res.json(db.transactions || []);
});

// VERIFY NIN + SAVE TRANSACTION
app.post("/verify-nin", (req, res) => {
  const { nin } = req.body;

  const db = readDB();

  if (db.balance < 100) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  db.balance -= 100;

  const transaction = {
    id: Date.now(),
    type: "NIN",
    nin,
    amount: 100,
    status: "success",
    date: new Date().toISOString(),
  };

  db.transactions = db.transactions || [];
  db.transactions.unshift(transaction);

  writeDB(db);

  res.json({
    status: "success",
    data: {
      nin,
      name: "Test User",
      phone: "08012345678",
      dob: "1995-01-01",
    },
    balance: db.balance,
  });
});

// ADD MONEY
app.post("/fund", (req, res) => {
  const { amount } = req.body;

  const db = readDB();

  db.balance += Number(amount);

  const transaction = {
    id: Date.now(),
    type: "FUND",
    amount: Number(amount),
    status: "success",
    date: new Date().toISOString(),
  };

  db.transactions.unshift(transaction);

  writeDB(db);

  res.json({ balance: db.balance });
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});