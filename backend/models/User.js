const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  nin: String,

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: String,

  balance: {
    type: Number,
    default: 0,
  },


  units: {
      type: Number,
      default: 0,
    },

  // 🔥 NEW FIELD
  status: {
    type: String,
    enum: ["active", "suspended"],
    default: "active",
  },

}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);