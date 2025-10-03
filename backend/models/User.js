const mongoose = require('mongoose');

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hasReceivedEmail: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

module.exports = User;