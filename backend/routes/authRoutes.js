const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/signup - but original was /api/users/signup
router.post('/signup', authController.signup);

// POST /api/auth/login - but original was /api/users/login
router.post('/login', authController.login);

// POST /api/auth/google
router.post('/google', authController.googleLogin);

module.exports = router;