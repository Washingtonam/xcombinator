const mongoose = require("mongoose");

const SUPER_ADMIN_EMAIL = "washingtonamedu@gmail.com";

const userSchema = new mongoose.Schema({
  firstName: { type: String, default: "", trim: true },
  lastName: { type: String, default: "", trim: true },
  nin: { type: String, default: "", trim: true },

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

  status: {
    type: String,
    enum: ["active", "suspended"],
    default: "active",
  },

  role: {
    type: String,
    enum: ["user", "admin", "super_admin"],
    default: "user",
  },

  lastLogin: {
    type: Date,
    default: null,
  },

}, {
  timestamps: true,
});


// ==============================
// 🔥 FIXED HOOK (NO next())
// ==============================
userSchema.pre("save", function () {
  if (
    this.email &&
    this.email.toLowerCase().trim() === SUPER_ADMIN_EMAIL
  ) {
    this.role = "super_admin";
    this.status = "active";
  }
});


// ==============================
// 🚫 PROTECT SUPER ADMIN DELETE
// ==============================
userSchema.pre("findOneAndDelete", async function () {
  const doc = await this.model.findOne(this.getFilter());

  if (doc && doc.email === SUPER_ADMIN_EMAIL) {
    throw new Error("Cannot delete super admin");
  }
});


// ==============================
// 🚫 PROTECT SUPER ADMIN UPDATE
// ==============================
userSchema.pre("findOneAndUpdate", async function () {
  const doc = await this.model.findOne(this.getFilter());

  if (doc && doc.email === SUPER_ADMIN_EMAIL) {
    if (this._update?.role && this._update.role !== "super_admin") {
      throw new Error("Cannot change super admin role");
    }

    if (this._update?.status === "suspended") {
      throw new Error("Cannot suspend super admin");
    }
  }
});


// ==============================
// ✅ SAFE EXPORT
// ==============================
module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);