const Transaction = require('../models/Transaction');

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId });
    console.log('Fetched transactions:', transactions);
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Fetch transactions error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching transactions' });
  }
};

// Create transaction
exports.createTransaction = async (req, res) => {
  try {
    const { amount, date, description, category, subcategory, account } = req.body;

    // Basic validation
    if (!amount || !date || !category || !account) {
      return res.status(400).json({ message: 'Amount, date, category, and account are required' });
    }

    const transactionData = {
      userId: req.user.userId,
      amount: parseFloat(amount),
      date: new Date(date),
      description: description || '',
      category,
      subcategory: subcategory || '',
      account
    };

    const transaction = new Transaction(transactionData);
    await transaction.save();

    return res.status(201).json({ message: 'Transaction created successfully', transaction });
  } catch (error) {
    console.error('Transaction creation error:', error);
    return res.status(400).json({ message: error.message });
  }
};

// Get transaction by ID
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    return res.status(200).json(transaction);
  } catch (error) {
    console.error('Fetch transaction error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    console.log('Received update data:', req.body);
    const transactionData = {
      amount: req.body.amount,
      date: new Date(req.body.date),
      description: req.body.description || null,
      category: req.body.category,
      subcategory: req.body.subcategory,
      account: req.body.account
    };
    if (!transactionData.account || !transactionData.category) {
      return res.status(400).json({ message: 'Account and Category are required' });
    }
    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, transactionData, { new: true, runValidators: true });
    if (!updatedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    return res.status(200).json({ message: 'Transaction updated successfully', transaction: updatedTransaction });
  } catch (error) {
    console.error('Transaction update error:', error.message);
    return res.status(400).json({ message: error.message });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedTransaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    return res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
};