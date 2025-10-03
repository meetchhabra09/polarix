const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/transactions
router.get('/transactions', authMiddleware, transactionController.getTransactions);

// POST /api/transactions
router.post('/transactions', authMiddleware, transactionController.createTransaction);

// GET /api/transactions/:id
router.get('/transactions/:id', authMiddleware, transactionController.getTransaction);

// PUT /api/transactions/:id
router.put('/transactions/:id', authMiddleware, transactionController.updateTransaction);

// DELETE /api/transactions/:id
router.delete('/transactions/:id', authMiddleware, transactionController.deleteTransaction);

module.exports = router;