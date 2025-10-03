const mongoose = require('mongoose');

// Category Schema with Compound Unique Index
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subcategories: [{ type: String }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

categorySchema.index({ name: 1, userId: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;