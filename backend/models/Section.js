const mongoose = require('mongoose');

// Section Schema
const sectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true, enum: ['Income', 'Expense', 'Transfer', 'Asset', 'Liability'] },
  subcategory: { type: String, required: true },
  total: { type: Number, default: 0 }
});

sectionSchema.index({ userId: 1, category: 1, subcategory: 1 }, { unique: true }); // Ensure unique combination

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;