const mongoose = require('mongoose');

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: false },
  category: { type: String, required: true }, // Removed enum to allow any category
  subcategory: { type: String },
  account: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;