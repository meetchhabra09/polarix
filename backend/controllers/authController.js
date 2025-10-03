const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Category = require('../models/Category');
const Account = require('../models/Account');
const { JWT_SECRET } = require('../config/jwt');
const { sendThankYouEmail } = require('../utils/email');
const { googleClient } = require('../utils/googleAuth');

// Signup
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();
    console.log('New user saved with ID:', user._id);

    const defaultCategories = [
      { name: 'Income', subcategories: ['Salary', 'Freelance', 'Investments'], userId: user._id },
      { name: 'Expense', subcategories: ['Rent', 'Groceries', 'Utilities'], userId: user._id },
      { name: 'Transfer', subcategories: ['Bank Transfer', 'Cash Withdrawal'], userId: user._id },
      { name: 'Asset', subcategories: ['Real Estate', 'Stocks'], userId: user._id },
      { name: 'Liability', subcategories: ['Loan', 'Credit Card Debt'], userId: user._id }
    ];
    const existingCategories = await Category.find({ userId: user._id });
    console.log('Existing categories for user:', existingCategories);
    const categoriesToInsert = defaultCategories.filter(df => 
      !existingCategories.some(ec => ec.name === df.name)
    );
    if (categoriesToInsert.length > 0) {
      await Category.insertMany(categoriesToInsert, { ordered: false });
      console.log('Inserted new categories:', categoriesToInsert);
    } else {
      console.log('No new categories to insert for user:', user._id);
    }

    const defaultAccounts = [
      { name: 'Bank', userId: user._id },
      { name: 'Cash', userId: user._id },
      { name: 'Credit Card', userId: user._id },
      { name: 'Other', userId: user._id }
    ];
    const existingAccounts = await Account.find({ userId: user._id });
    console.log('Existing accounts for user:', existingAccounts);
    const accountsToInsert = defaultAccounts.filter(df => 
      !existingAccounts.some(ec => ec.name === df.name)
    );
    if (accountsToInsert.length > 0) {
      await Account.insertMany(accountsToInsert, { ordered: false });
      console.log('Inserted new accounts:', accountsToInsert);
    } else {
      console.log('No new accounts to insert for user:', user._id);
    }

    // Wait for email sending and include status in response
    const emailSent = await sendThankYouEmail(email, username);
    if (emailSent) {
      user.hasReceivedEmail = true;
      await user.save().catch(err => console.error('Error updating email status:', err));
    }

    console.log('Response being sent:', { message: 'User created successfully', emailStatus: emailSent ? 'sent' : 'failed' });
    return res.status(201).json({ 
      message: 'User created successfully',
      emailStatus: emailSent ? 'sent' : 'failed'
    });

  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      const collection = error.message.includes('categories') ? 'categories' : 
                        error.message.includes('accounts') ? 'accounts' : 'unknown';
      return res.status(400).json({ 
        message: `Duplicate key error in ${collection} collection. Some default data may already exist. Details: ${error.message}` 
      });
    }
    return res.status(400).json({ message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ 
      message: 'Login successful',
      token,
      username: user.username,
      email: user.email,
      userId: user._id
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message });
  }
};

// Google Login
exports.googleLogin = async (req, res) => {
  const { credential } = req.body;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: "562166999915-35gr94lrk1ui7nmljshk9paoigppe690.apps.googleusercontent.com",
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;
    
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ username: name, email, password: 'google_auth_user' });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      user: {
        username: user.username,
        email: user.email,
        userId: user._id,
        token
      }
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ success: false, message: "Invalid Google token" });
  }
};