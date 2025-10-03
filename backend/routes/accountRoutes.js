const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/accounts
router.post('/accounts', authMiddleware, accountController.createAccount);

// GET /api/accounts
router.get('/accounts', authMiddleware, accountController.getAccounts);

// PUT /api/accounts/:id
router.put('/accounts/:id', authMiddleware, accountController.updateAccount);

module.exports = router;