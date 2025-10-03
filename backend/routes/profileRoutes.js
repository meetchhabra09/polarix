const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/profile
router.post('/profile', authMiddleware, profileController.createOrUpdateProfile);

// GET /api/profile/:email
router.get('/profile/:email', authMiddleware, profileController.getProfile);

module.exports = router;