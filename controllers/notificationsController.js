const buildCrudController = require('./crudFactory');
const Notification = require('../models/Notification');

const crud = buildCrudController(Notification);

const markAsRead = async (req, res) => {
  try {
    const doc = await Notification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { isRead: true }, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Marked as read', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All marked as read', data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = { ...crud, markAsRead, markAllAsRead };
