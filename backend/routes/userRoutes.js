const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Auth routes (to maintain original API structure)
// POST /api/users/signup
router.post('/signup', authController.signup);

// POST /api/users/login
router.post('/login', authController.login);

// User profile routes
// GET /api/users/profile
router.get('/profile', authMiddleware, userController.getUserProfile);

// PUT /api/users/profile
router.put('/profile', authMiddleware, userController.updateUserProfile);

// PUT /api/users/change-password
router.put('/change-password', authMiddleware, userController.changePassword);

// DELETE /api/users
router.delete('/', authMiddleware, userController.deleteUser);

module.exports = router;