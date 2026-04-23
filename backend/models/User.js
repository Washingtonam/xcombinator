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
  // 💰 WALLET
  // ==============================
  units: {
    type: Number,
    default: 0,
    min: 0,
  },

  balance: {
    type: Number,
    default: 0,
    min: 0,
  },

  // ==============================
  // 🚦 STATUS
  // ==============================
  status: {
    type: String,
    enum: ["active", "suspended"],
    default: "active",
  },

  // ==============================
  // 🔐 ROLE SYSTEM
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
// 🔥 FORCE SUPER ADMIN (CRITICAL)
// ==============================
userSchema.pre("save", function (next) {
  if (
    this.email &&
    this.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL
  ) {
    this.role = "super_admin";
    this.status = "active";
  }
  next();
});


// ==============================
// 🚫 BLOCK DELETE (SUPER ADMIN)
// ==============================
userSchema.pre("findOneAndDelete", async function (next) {
  const doc = await this.model.findOne(this.getFilter());

  if (doc?.email === SUPER_ADMIN_EMAIL) {
    return next(new Error("Cannot delete super admin"));
  }

  next();
});


// ==============================
// 🚫 BLOCK UPDATE (SUPER ADMIN)
// ==============================
userSchema.pre("findOneAndUpdate", async function (next) {
  const doc = await this.model.findOne(this.getFilter());

  if (doc?.email === SUPER_ADMIN_EMAIL) {

    // 🔒 Prevent role downgrade
    if (this._update?.role && this._update.role !== "super_admin") {
      return next(new Error("Cannot change super admin role"));
    }

    // 🔒 Prevent suspension
    if (this._update?.status === "suspended") {
      return next(new Error("Cannot suspend super admin"));
    }
  }

  next();
});


// ==============================
// 🔥 AUTO INDEX (PERFORMANCE BOOST)
// ==============================
userSchema.index({ email: 1 });


// ==============================
// ✅ EXPORT
// ==============================
module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);