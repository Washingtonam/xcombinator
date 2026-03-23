const express = require("express");
const cors = require("cors");

const authRoutes = require("./api/authRoutes");
const userRoutes = require("./api/userRoutes");
const verificationRoutes = require("./api/verificationRoutes");
const paymentRoutes = require("./api/paymentRoutes");
const adminRoutes = require("./api/adminRoutes");

const app = express();

// ✅ FIXED CORS CONFIG (PRODUCTION SAFE)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://www.xcombinator.com.ng",
    "https://xcombinator.com.ng"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// ROUTES
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", verificationRoutes);
app.use("/api", paymentRoutes);
app.use("/api/admin", adminRoutes);

// PRICING
const { readDB } = require("./utils/db");

app.get("/api/pricing", (req, res) => {
  const db = readDB();
  res.json(db.pricing);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});