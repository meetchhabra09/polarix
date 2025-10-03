const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/categories
router.post('/categories', authMiddleware, categoryController.createCategory);

// GET /api/categories
router.get('/categories', authMiddleware, categoryController.getCategories);

// PUT /api/categories/:id
router.put('/categories/:id', authMiddleware, categoryController.updateCategory);

// DELETE /api/categories/:id
router.delete('/categories/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router;