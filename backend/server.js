const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client("562166999915-35gr94lrk1ui7nmljshk9paoigppe690.apps.googleusercontent.com");



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your_jwt_secret_key'; // Replace with a secure, random key in production

// Middleware
app.use(cors());
app.use(bodyParser.json());



const path = require('path');

// Serve static files from ../public
app.use(express.static(path.join(__dirname, '..', 'public')));

// Serve signup.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'signup.html'));
});




// MongoDB Connection with improved error handling
mongoose.connect('mongodb+srv://pulkitsachdeva:test123@polarx.wq0hut2.mongodb.net/polarix?retryWrites=true&w=majority&appName=polarX', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1); // Exit if MongoDB fails to connect
});

// Ensure indexes are created on connection
mongoose.connection.on('connected', async () => {
  await Category.createIndexes();
  await Account.createIndexes();
  console.log('Indexes ensured');
});

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
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
  category: { type: String, required: true }, // Removed enum to allow any category
  subcategory: { type: String },
  account: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', transactionSchema);

// Section Schema (New)
const sectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true, enum: ['Income', 'Expense', 'Transfer', 'Asset', 'Liability'] },
  subcategory: { type: String, required: true },
  total: { type: Number, default: 0 }
});
sectionSchema.index({ userId: 1, category: 1, subcategory: 1 }, { unique: true }); // Ensure unique combination
const Section = mongoose.model('Section', sectionSchema);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access denied, no token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'polarix678@gmail.com', // Replace with your email
    pass: 'zlgp purl pctd iajp'   // Use an app password if 2FA is on
  }
});

// Send Thank You Email Function
async function sendThankYouEmail(toEmail, username) {
  const mailOptions = {
    from: 'Polarix Team <polarix678@gmail.com>',
    to: toEmail,
    subject: '🎉 Welcome to Polarix!',
    text: `Hi ${username},\n\nThank you for registering at Polarix. We're thrilled to have you on board! 🚀\n\nBest Regards,\nThe Polarix Team`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return false;
  }
}

// Signup Route with Default Categories, Accounts, and Email
app.post('/api/users/signup', async (req, res) => {
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
});

// Login Route
app.post('/api/users/login', async (req, res) => {
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
});



// Google Login Route
app.post('/api/auth/google', async (req, res) => {
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
});

// Profile Routes
app.post('/api/profile', authenticateToken, async (req, res) => {
  try {
    const profileData = { ...req.body, userId: req.user.userId };
    const existingProfile = await Profile.findOne({ email: req.body.email });
    if (existingProfile) {
      const updatedProfile = await Profile.findOneAndUpdate(
        { email: req.body.email },
        profileData,
        { new: true, runValidators: true }
      );
      return res.status(200).json({ message: 'Profile updated!', profile: updatedProfile });
    }
    const newProfile = new Profile(profileData);
    await newProfile.save();
    return res.status(201).json({ message: 'Profile saved!', profile: newProfile });
  } catch (error) {
    console.error('Profile operation error:', error);
    return res.status(400).json({ message: error.message });
  }
});

app.get('/api/profile/:email', authenticateToken, async (req, res) => {
  try {
    if (req.user.email !== req.params.email) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    const profile = await Profile.findOne({ email: req.params.email });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    return res.status(200).json(profile);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ message: error.message });
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
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    const category = new Category(categoryData);
    await category.save();
    return res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    console.error('Category creation error:', error);
    return res.status(400).json({ message: error.message });
  }
});

app.get('/api/categories', authenticateToken, async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user.userId });
    if (!categories || categories.length === 0) {
      return res.status(200).json([]);
    }

    // ✅ Ensure _id is included (Mongoose already includes it, unless you filter it out)
    return res.status(200).json(categories);
  } catch (error) {
    console.error('Category fetch error:', error);
    return res.status(500).json({ message: error.message });
  }
});


app.put('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const categoryData = {
      name: req.body.name,
      subcategories: req.body.subcategories || []
    };
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, categoryData, { new: true, runValidators: true });
    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }
    return res.status(200).json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error) {
    console.error('Update category error:', error.message);
    return res.status(400).json({ message: error.message });
  }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Category not found or already deleted' });
    }

    return res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error.message);
    return res.status(500).json({ message: 'Server error' });
  }
});


// Account Routes
app.post('/api/accounts', authenticateToken, async (req, res) => {
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
});

app.get('/api/accounts', authenticateToken, async (req, res) => {
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
});

app.put('/api/accounts/:id', authenticateToken, async (req, res) => {
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
});

// Transaction Routes
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.userId });
    console.log('Fetched transactions:', transactions);
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Fetch transactions error:', error.message);
    return res.status(500).json({ message: 'Server error while fetching transactions' });
  }
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
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
});

app.get('/api/transactions/:id', authenticateToken, async (req, res) => {
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
});

app.put('/api/transactions/:id', authenticateToken, async (req, res) => {
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
});

app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
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
});

// Section Routes (New)
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
    console.error('Section save error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/sections/:email/:category/:subcategory', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const section = await Section.findOne({
      userId: user._id,
      category: req.params.category,
      subcategory: req.params.subcategory
    });
    if (!section) return res.json({ total: 0 });
    res.json(section);
  } catch (error) {
    console.error('Section fetch error:', error.message);
    res.status(500).json({ message: error.message });
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





// app.get('/api/transactions/summary', authenticateToken, async (req, res) => {
//   try {
//     const transactions = await Transaction.find({ userId: req.user.userId });
//     let income = 0, expense = 0, assets = 0, liabilities = 0;
//     transactions.forEach(t => {
//       const amt = Number(t.amount);
//       switch (t.category) {
//         case 'Income': income += amt; break;
//         case 'Expense': expense += amt; break;
//         case 'Asset': assets += amt; break;
//         case 'Liability': liabilities += amt; break;
//       }
//     });
//     const savings = income - expense;
//     res.json({ income, expense, assets, liabilities, savings });
//   } catch (err) {
//     console.error('Summary error:', err);
//     res.status(500).json({ message: 'Failed to fetch summary' });
//   }
// });
