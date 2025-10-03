const Category = require('../models/Category');

// Create category
exports.createCategory = async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    if (!name || !Array.isArray(subcategories) || subcategories.length === 0) {
      return res.status(400).json({ message: 'Name and subcategories are required' });
    }
    const categoryData = { name, subcategories, userId: req.user.userId };
    const existingCategory = await Category.findOne({ name, userId: req.user.userId });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    const category = new Category(categoryData);
    await category.save();
    return res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Category creation error:', error);
    return res.status(400).json({ message: error.message });
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.userId });
    if (!categories || categories.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Category fetch error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const categoryData = {
      name: req.body.name,
      subcategories: req.body.subcategories || []
    };
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, categoryData, { new: true, runValidators: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error) {
    console.error('Update category error:', error.message);
    return res.status(400).json({ message: error.message });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Category not found or already deleted' });
    }

    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};