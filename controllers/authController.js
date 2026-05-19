const User = require('../models/User');
const UserStats = require('../models/UserStats');
const Wallet = require('../models/Wallet');
const { seedDefaultsForUser } = require('./categoryLocksController');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * POST /api/auth/signup
 */
const signup = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists', data: null });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || '',
      location: location || '',
    });

    // Initialize companion documents
    await UserStats.create({ userId: user._id });
    await Wallet.create({ userId: user._id });

    // Seed default category locks for the new user
    await seedDefaultsForUser(user._id);

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

    const userData = user.toObject();
    delete userData.password;

    res.status(201).json({ success: true, message: 'Account created successfully', data: { token, user: userData } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found', data: null });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Wrong password', data: null });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' });

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({ success: true, message: 'Login successful', data: { token, user: userData } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = { signup, login };
