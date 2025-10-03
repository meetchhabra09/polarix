const mongoose = require('mongoose');

// Account Schema with Compound Unique Index
const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

accountSchema.index({ name: 1, userId: 1 }, { unique: true });

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;