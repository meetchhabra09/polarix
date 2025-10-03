const Account = require('../models/Account');

// Create account
exports.createAccount = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Account name is required' });
    }
    const accountData = { name, userId: req.user.userId };
    const existingAccount = await Account.findOne({ name, userId: req.user.userId });
    if (existingAccount) {
      return res.status(400).json({ message: 'Account already exists' });
    }
    const account = new Account(accountData);
    await account.save();
    return res.status(201).json({ message: 'Account created successfully', account });
  } catch (error) {
    console.error('Account creation error:', error);
    return res.status(400).json({ message: error.message });
  }
};

// Get all accounts
exports.getAccounts = async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user.userId });
    if (!accounts || accounts.length === 0) {
      return res.status(200).json([]);
    }
    return res.status(200).json(accounts);
  } catch (error) {
    console.error('Account fetch error:', error);
    return res.status(500).json({ message: 'Error fetching accounts' });
  }
};

// Update account
exports.updateAccount = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Account name is required' });
    }
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      { name },
      { new: true, runValidators: true }
    );
    if (!account) return res.status(404).json({ message: 'Account not found' });
    return res.status(200).json({ message: 'Account updated successfully', account });
  } catch (error) {
    console.error('Account update error:', error);
    return res.status(400).json({ message: error.message });
  }
};