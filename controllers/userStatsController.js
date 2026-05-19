const UserStats = require('../models/UserStats');

const getStats = async (req, res) => {
  try {
    let stats = await UserStats.findOne({ userId: req.user.id });
    if (!stats) stats = await UserStats.create({ userId: req.user.id });
    res.status(200).json({ success: true, message: 'Stats retrieved', data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const updateStats = async (req, res) => {
  try {
    const stats = await UserStats.findOneAndUpdate({ userId: req.user.id }, req.body, { new: true, runValidators: true, upsert: true });
    res.status(200).json({ success: true, message: 'Stats updated', data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = { getStats, updateStats };
