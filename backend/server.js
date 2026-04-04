require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./api/authRoutes");
const userRoutes = require("./api/userRoutes");
const verificationRoutes = require("./api/verificationRoutes");
const paymentRoutes = require("./api/paymentRoutes");
const adminRoutes = require("./api/adminRoutes");
const slipRoutes = require("./api/slipRoutes");

const Pricing = require("./models/Pricing"); // ✅ NEW SYSTEM

const app = express();

// ==============================
// ✅ CORS CONFIG
// ==============================
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

// ==============================
// 🚀 ROUTES
// ==============================
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", verificationRoutes);
app.use("/api", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", slipRoutes);

// ==============================
// 💰 PRICING (FROM DATABASE)
// ==============================
app.get("/api/pricing", async (req, res) => {
  try {
    const pricing = await Pricing.findOne();

    if (!pricing) {
      return res.json({
        nin: {
          unitPrice: 250,
          agentPrice: 150,
        },
      });
    }

    res.json(pricing);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch pricing" });
  }
});

// ==============================
// 🚀 START SERVER
// ==============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});