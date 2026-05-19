const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Profile retrieved', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { password, email, ...updateData } = req.body;

    // Validate profilePictureUrl format if provided
    if (updateData.profilePictureUrl && typeof updateData.profilePictureUrl === 'string') {
      try {
        new URL(updateData.profilePictureUrl);
      } catch {
        return res.status(400).json({
          success: false,
          message: 'Invalid profilePictureUrl format',
          data: null,
        });
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Profile updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const findByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required', data: null });

    const user = await User.findOne({ email: email.toLowerCase() }).select('name email profilePictureUrl _id');
    if (!user) return res.status(404).json({ success: false, message: 'User not found', data: null });

    res.status(200).json({ success: true, message: 'User found', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = { getProfile, updateProfile, findByEmail };
