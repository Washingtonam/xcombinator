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
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);