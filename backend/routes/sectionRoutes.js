const express = require('express');
const router = express.Router();
const sectionController = require('../controllers/sectionController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/sections
router.post('/sections', authMiddleware, sectionController.createOrUpdateSection);

// GET /api/sections/:email/:category/:subcategory
router.get('/sections/:email/:category/:subcategory', authMiddleware, sectionController.getSection);

module.exports = router;