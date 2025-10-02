// server.js
require('dotenv').config(); // load env variables from .env

const { OAuth2Client } = require('google-auth-library');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_in_production';

// Ensure required env variables exist (warn if not)
if (!process.env.MONGO_URI) {
  console.warn('WARNING: MONGO_URI is not set. The app will fail to connect to the database.');
}
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('WARNING: EMAIL_USER or EMAIL_PASS is not set. Email functionality will not work.');
}
if (!process.env.GOOGLE_CLIENT_ID) {
  console.warn('WARNING: GOOGLE_CLIENT_ID is not set. Google login will not work.');
}

// Setup Google OAuth2 client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Middleware
app.use(cors()); // consider restricting origin in production
app.use(bodyParser.json());

// Serve static files from ../public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve signup.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'signup.html'));
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});

// Schemas & Models

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  hasReceivedEmail: { type: Boolean, default: false }
});
const User = mongoose.model('User', userSchema);

// Profile Schema
const profileSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  gender: { type: String, required: true },
  maritalStatus: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  occupation: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  city: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  incomeStability: { type: String, required: true },
  investmentPercentage: { type: String, required: true },
  riskAppetite: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
const Profile = mongoose.model('Profile', profileSchema);

// Category Schema with Compound Unique Index
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  subcategories: [{ type: String }],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
categorySchema.index({ name: 1, userId: 1 }, { unique: true });
const Category = mongoose.model('Category', categorySchema);

// Account Schema with Compound Unique Index
const accountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
accountSchema.index({ name: 1, userId: 1 }, { unique: true });
const Account = mongoose.model('Account', accountSchema);

// Transaction Schema
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: false },
  category: { type: String, required: true },
  subcategory: { type: String },
  account: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', transactionSchema);

// Section Schema
const sectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true, enum: ['Income', 'Expense', 'Transfer', 'Asset', 'Liability'] },
  subcategory: { type: String, required: true },
  total: { type: Number, default: 0 }
});
sectionSchema.index({ userId: 1, category: 1, subcategory: 1 }, { unique: true });
const Section = mongoose.model('Section', sectionSchema);

// Ensure indexes once connected
mongoose.connection.on('connected', async () => {
  try {
    await Category.createIndexes();
    await Account.createIndexes();
    console.log('Indexes ensured for Category and Account');

    // Create dummy excel for users (if not already present)
    await createDummyExcelForAllUsers();
  } catch (err) {
    console.error('Error ensuring indexes or creating dummy excels:', err.message);
  }
});

async function createDummyExcelForAllUsers() {
  try {
    const users = await User.find({});
    const folderPath = path.join(__dirname, 'dummy_data');
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });

    const dummyDataTemplate = [
      { amount: 5000, date: '2025-04-01', description: 'Salary', category: 'Income', subcategory: 'Salary', account: 'Bank' },
      { amount: 200, date: '2025-04-02', description: 'Snacks', category: 'Expense', subcategory: 'Food', account: 'Cash' },
      { amount: 1500, date: '2025-04-03', description: 'Mutual Fund', category: 'Asset', subcategory: 'Investments', account: 'Bank' },
      { amount: 10000, date: '2025-04-04', description: 'EMI', category: 'Liability', subcategory: 'Loan', account: 'Credit Card' }
    ];

    for (const user of users) {
      const filePath = path.join(folderPath, `${user._id}.xlsx`);
      if (!fs.existsSync(filePath)) {
        const worksheet = XLSX.utils.json_to_sheet(dummyDataTemplate);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
        XLSX.writeFile(workbook, filePath);
        console.log(`✅ Dummy Excel created for user: ${user.username}`);
      } else {
        console.log(`✔️ Excel already exists for user: ${user.username}`);
      }
    }
  } catch (err) {
    console.error('createDummyExcelForAllUsers error:', err.message);
  }
}

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access denied, no token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err && err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Nodemailer Configuration (using env vars)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send Thank You Email Function
async function sendThankYouEmail(toEmail, username) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured, aborting sendThankYouEmail.');
    return false;
  }
  const mailOptions = {
    from: `Polarix Team <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🎉 Welcome to Polarix!',
    text: `Hi ${username},\n\nThank you for registering at Polarix. We're thrilled to have you on board! 🚀\n\nBest Regards,\nThe Polarix Team`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response || info);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error && error.message);
    return false;
  }
}

// Routes

// Signup Route with Default Categories, Accounts, and Email
app.post('/api/users/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ message: 'username, email and password are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists with this email.' });

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
    const categoriesToInsert = defaultCategories.filter(df => !existingCategories.some(ec => ec.name === df.name));
    if (categoriesToInsert.length > 0) {
      try {
        await Category.insertMany(categoriesToInsert, { ordered: false });
        console.log('Inserted new categories:', categoriesToInsert.map(c => c.name));
      } catch (err) {
        // ignore duplicate errors caused by race conditions
        console.warn('Some default categories may already exist:', err.message);
      }
    }

    const defaultAccounts = [
      { name: 'Bank', userId: user._id },
      { name: 'Cash', userId: user._id },
      { name: 'Credit Card', userId: user._id },
      { name: 'Other', userId: user._id }
    ];
    const existingAccounts = await Account.find({ userId: user._id });
    const accountsToInsert = defaultAccounts.filter(df => !existingAccounts.some(ec => ec.name === df.name));
    if (accountsToInsert.length > 0) {
      try {
        await Account.insertMany(accountsToInsert, { ordered: false });
        console.log('Inserted new accounts:', accountsToInsert.map(a => a.name));
      } catch (err) {
        console.warn('Some default accounts may already exist:', err.message);
      }
    }

    // create dummy excel for this user
    const folderPath = path.join(__dirname, 'dummy_data');
    if (!fs.existsSync(folderPath)) fs.mkdirSync(folderPath, { recursive: true });
    const dummyFilePath = path.join(folderPath, `${user._id}.xlsx`);
    if (!fs.existsSync(dummyFilePath)) {
      const dummyData = [
        { amount: 5000, date: '2025-04-01', description: 'Salary', category: 'Income', subcategory: 'Salary', account: 'Bank' },
        { amount: 200, date: '2025-04-02', description: 'Snacks', category: 'Expense', subcategory: 'Food', account: 'Cash' },
        { amount: 1500, date: '2025-04-03', description: 'Mutual Fund', category: 'Asset', subcategory: 'Investments', account: 'Bank' },
        { amount: 10000, date: '2025-04-04', description: 'EMI', category: 'Liability', subcategory: 'Loan', account: 'Credit Card' }
      ];
      const worksheet = XLSX.utils.json_to_sheet(dummyData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
      XLSX.writeFile(workbook, dummyFilePath);
    }

    const emailSent = await sendThankYouEmail(email, username);
    if (emailSent) {
      user.hasReceivedEmail = true;
      try { await user.save(); } catch (err) { console.warn('Could not update hasReceivedEmail:', err.message); }
    }

    return res.status(201).json({
      message: 'User created successfully',
      emailStatus: emailSent ? 'sent' : 'failed'
    });
  } catch (error) {
    console.error('Signup error:', error && error.message);
    if (error && error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error. Some data may already exist.' });
    }
    return res.status(400).json({ message: error.message || 'Unknown error' });
  }
});

// Login Route
app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'username and password required' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({
      message: 'Login successful',
      token,
      username: user.username,
      email: user.email,
      userId: user._id
    });
  } catch (error) {
    console.error('Login error:', error && error.message);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Google Login Route
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  try {
    if (!credential) return res.status(400).json({ message: 'No credential provided' });

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      // Create a user with a random password (not used)
      const randomPass = Math.random().toString(36).slice(-12);
      user = new User({ username: name, email, password: await bcrypt.hash(randomPass, 10) });
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
    console.error('Google login error:', error && error.message);
    res.status(401).json({ success: false, message: 'Invalid Google token' });
  }
});

// Profile Routes (protected)
app.post('/api/profile', authenticateToken, async (req, res) => {
  try {
    const profileData = { ...req.body, userId: req.user.userId };
    const existingProfile = await Profile.findOne({ email: req.body.email });
    if (existingProfile) {
      const updatedProfile = await Profile.findOneAndUpdate({ email: req.body.email }, profileData, { new: true, runValidators: true });
      return res.status(200).json({ message: 'Profile updated!', profile: updatedProfile });
    }
    const newProfile = new Profile(profileData);
    await newProfile.save();
    return res.status(201).json({ message: 'Profile saved!', profile: newProfile });
  } catch (error) {
    console.error('Profile operation error:', error && error.message);
    return res.status(400).json({ message: error.message || 'Error saving profile' });
  }
});

app.get('/api/profile/:email', authenticateToken, async (req, res) => {
  try {
    if (req.user.email !== req.params.email) return res.status(403).json({ message: 'Unauthorized' });
    const profile = await Profile.findOne({ email: req.params.email });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    return res.status(200).json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error && error.message);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Category Routes
app.post('/api/categories', authenticateToken, async (req, res) => {
  try {
    const { name, subcategories } = req.body;
    if (!name || !Array.isArray(subcategories) || subcategories.length === 0) {
      return res.status(400).json({ message: 'Name and subcategories are required' });
    }
    const categoryData = { name, subcategories, userId: req.user.userId };
    const existingCategory = await Category.findOne({ name, userId: req.user.userId });
    if (existingCategory) return res.status(400).json({ message: 'Category already exists' });

    const category = new Category(categoryData);
    await category.save();
    return res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Category creation error:', error && error.message);
    return res.status(400).json({ message: error.message || 'Error creating category' });
  }
});

app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.userId });
    return res.status(200).json(categories || []);
  } catch (error) {
    console.error('Category fetch error:', error && error.message);
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

app.put('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const categoryData = { name: req.body.name, subcategories: req.body.subcategories || [] };
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, categoryData, { new: true, runValidators: true });
    if (!updatedCategory) return res.status(404).json({ message: 'Category not found' });
    return res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error) {
    console.error('Update category error:', error && error.message);
    return res.status(400).json({ message: error.message || 'Error updating category' });
  }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!deleted) return res.status(404).json({ message: 'Category not found or already deleted' });
    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error && error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Account Routes
app.post('/api/accounts', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Account name is required' });
    const accountData = { name, userId: req.user.userId };
    const existingAccount = await Account.findOne({ name, userId: req.user.userId });
    if (existingAccount) return res.status(400).json({ message: 'Account already exists' });

    const account = new Account(accountData);
    await account.save();
    return res.status(201).json({ message: 'Account created successfully', account });
  } catch (error) {
    console.error('Account creation error:', error && error.message);
    return res.status(400).json({ message: error.message || 'Error creating account' });
  }
});

app.get('/api/accounts', authenticateToken, async (req, res) => {
  try {
    const accounts = await Account.find({ userId: req.user.userId });
    return res.status(200).json(accounts || []);
  } catch (error) {
    console.error('Account fetch error:', error && error.message);
    return res.status(500).json({ message: 'Error fetching accounts' });
  }
});

app.put('/api/accounts/:id', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Account name is required' });
    const account = await Account.findOneAndUpdate({ _id: req.params.id, userId: req.user.userId }, { name }, { new: true, runValidators: true });
    if (!account) return res.status(404).json({ message: 'Account not found' });
    return res.status(200).json({ message: 'Account updated successfully', account });
  } catch (error) {
    console.error('Account update error:', error && error.message);
    return res.status(400).json({ message: error.message || 'Error updating account' });
  }
});

// Transaction Routes
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId });
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Fetch transactions error:', error && error.message);
    return res.status(500).json({ message: 'Server error while fetching transactions' });
  }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { amount, date, description, category, subcategory, account } = req.body;
    if (!amount || !date || !category || !account) return res.status(400).json({ message: 'Amount, date, category, and account are required' });

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
    console.error('Transaction creation error:', error && error.message);
    return res.status(400).json({ message: error.message || 'Error creating transaction' });
  }
});

app.get('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    return res.status(200).json(transaction);
  } catch (error) {
    console.error('Fetch transaction error:', error && error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const transactionData = {
      amount: req.body.amount,
      date: new Date(req.body.date),
      description: req.body.description || null,
      category: req.body.category,
      subcategory: req.body.subcategory,
      account: req.body.account
    };
    if (!transactionData.account || !transactionData.category) return res.status(400).json({ message: 'Account and Category are required' });

    const updatedTransaction = await Transaction.findByIdAndUpdate(req.params.id, transactionData, { new: true, runValidators: true });
    if (!updatedTransaction) return res.status(404).json({ message: 'Transaction not found' });
    return res.status(200).json({ message: 'Transaction updated successfully', transaction: updatedTransaction });
  } catch (error) {
    console.error('Transaction update error:', error && error.message);
    return res.status(400).json({ message: error.message || 'Error updating transaction' });
  }
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!deletedTransaction) return res.status(404).json({ message: 'Transaction not found' });
    return res.status(200).json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error && error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Section Routes
app.post('/api/sections', authenticateToken, async (req, res) => {
  try {
    const { email, category, data } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    for (const [subcategory, total] of Object.entries(data)) {
      let section = await Section.findOne({ userId: user._id, category, subcategory });
      if (section) {
        section.total = total;
        await section.save();
      } else {
        section = new Section({ userId: user._id, category, subcategory, total });
        await section.save();
      }
    }
    res.json({ message: 'Section updated successfully!' });
  } catch (error) {
    console.error('Section save error:', error && error.message);
    res.status(500).json({ message: error.message || 'Error saving section' });
  }
});

app.get('/api/sections/:email/:category/:subcategory', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const section = await Section.findOne({ userId: user._id, category: req.params.category, subcategory: req.params.subcategory });
    if (!section) return res.json({ total: 0 });
    res.json(section);
  } catch (error) {
    console.error('Section fetch error:', error && error.message);
    res.status(500).json({ message: error.message || 'Error fetching section' });
  }
});

// Error handling for undefined routes
app.use((req, res) => {
  return res.status(404).json({ message: 'Route not found' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
