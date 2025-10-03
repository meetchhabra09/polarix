const Section = require('../models/Section');
const User = require('../models/User');

// Create or update section
exports.createOrUpdateSection = async (req, res) => {
  try {
    const { email, category, data } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    for (const [subcategory, total] of Object.entries(data)) {
      let section = await Section.findOne({ userId: user._id, category, subcategory });
      if (section) {
        section.total = total;
        await section.save();
      } else {
        section = new Section({ userId: user._id, category, subcategory, total });
        await section.save();
      }
    }
    res.json({ message: 'Section updated successfully!' });
  } catch (error) {
    console.error('Section save error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// Get section
exports.getSection = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const section = await Section.findOne({
      userId: user._id,
      category: req.params.category,
      subcategory: req.params.subcategory
    });
    if (!section) return res.json({ total: 0 });
    res.json(section);
  } catch (error) {
    console.error('Section fetch error:', error.message);
    res.status(500).json({ message: error.message });
  }
};