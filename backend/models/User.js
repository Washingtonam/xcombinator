const mongoose = require("mongoose");

const SUPER_ADMIN_EMAIL = "washingtonamedu@gmail.com";

const userSchema = new mongoose.Schema({
  // ==============================
  // 👤 BASIC INFO
  // ==============================
  firstName: {
    type: String,
    default: "",
    trim: true,
  },

  lastName: {
    type: String,
    default: "",
    trim: true,
  },

  nin: {
    type: String,
    default: "",
    trim: true,
  },

  // ==============================
  // 📧 AUTH
  // ==============================
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  // ==============================
  // 💰 WALLET SYSTEM
  // ==============================
  units: {
    type: Number,
    default: 0,
    min: 0,
  },

  // 🔁 legacy support
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },

  // ==============================
  // 🚦 ACCOUNT STATUS
  // ==============================
  status: {
    type: String,
    enum: ["active", "suspended"],
    default: "active",
  },

  // ==============================
  // 🔥 ROLE SYSTEM (FINAL)
  // ==============================
  role: {
    type: String,
    enum: ["user", "admin", "super_admin"],
    default: "user",
  },

  // ==============================
  // 📊 TRACKING
  // ==============================
  lastLogin: {
    type: Date,
    default: null,
  },

}, {
  timestamps: true,
});


// ==============================
// 🔥 FORCE SUPER ADMIN (IMMUTABLE)
// ==============================
userSchema.pre("save", function (next) {

  if (this.email && this.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL) {
    this.role = "super_admin"; // 🔒 ALWAYS SUPER ADMIN
    this.status = "active";    // 🔒 CANNOT BE SUSPENDED
  }

  next();
});


// ==============================
// 🚫 PROTECT SUPER ADMIN FROM DELETE
// ==============================
userSchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.model.findOne(this.getFilter());

  if (doc && doc.email === SUPER_ADMIN_EMAIL) {
    throw new Error("Cannot delete super admin");
  }

  next();
});


// ==============================
// 🚫 PROTECT SUPER ADMIN FROM UPDATE
// ==============================
userSchema.pre("findOneAndUpdate", async function (next) {
  const doc = await this.model.findOne(this.getFilter());

  if (doc && doc.email === SUPER_ADMIN_EMAIL) {
    if (this._update?.role && this._update.role !== "super_admin") {
      throw new Error("Cannot change super admin role");
    }

    if (this._update?.status === "suspended") {
      throw new Error("Cannot suspend super admin");
    }
  }

  next();
});


// ==============================
// ✅ SAFE EXPORT
// ==============================
module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);