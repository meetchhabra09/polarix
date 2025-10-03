const Profile = require('../models/Profile');

// Create or update profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const profileData = { ...req.body, userId: req.user.userId };
    const existingProfile = await Profile.findOne({ email: req.body.email });
    if (existingProfile) {
      const updatedProfile = await Profile.findOneAndUpdate(
        { email: req.body.email },
        profileData,
        { new: true, runValidators: true }
      );
      return res.status(200).json({ message: 'Profile updated!', profile: updatedProfile });
    }
    const newProfile = new Profile(profileData);
    await newProfile.save();
    return res.status(201).json({ message: 'Profile saved!', profile: newProfile });
  } catch (error) {
    console.error('Profile operation error:', error);
    return res.status(400).json({ message: error.message });
  }
};

// Get profile by email
exports.getProfile = async (req, res) => {
  try {
    if (req.user.email !== req.params.email) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const profile = await Profile.findOne({ email: req.params.email });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    return res.status(200).json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ message: error.message });
  }
};