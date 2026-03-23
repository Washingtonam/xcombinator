const express = require("express");
const cors = require("cors");

const authRoutes = require("./api/authRoutes");
const userRoutes = require("./api/userRoutes");
const verificationRoutes = require("./api/verificationRoutes");
const paymentRoutes = require("./api/paymentRoutes");
const adminRoutes = require("./api/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", verificationRoutes);
app.use("/api", paymentRoutes);
app.use("/api/admin", adminRoutes);

// PRICING (simple route)
const { readDB } = require("./utils/db");

app.get("/api/pricing", (req, res) => {
  const db = readDB();
  res.json(db.pricing);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});