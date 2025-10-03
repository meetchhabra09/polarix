const mongoose = require('mongoose');

// Profile Schema
const profileSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  gender: { type: String, required: true },
  maritalStatus: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  occupation: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  city: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  incomeStability: { type: String, required: true },
  investmentPercentage: { type: String, required: true },
  riskAppetite: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;