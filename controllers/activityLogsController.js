const ActivityLog = require('../models/ActivityLog');

/**
 * GET /api/activity-logs
 * List all activity logs for the authenticated user.
 * Sorted by timestamp descending (most recent first).
 */
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'timestamp', order = 'desc', from, to, ...filters } = req.query;

    const query = { userId: req.user.id };

    // Apply filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== '') {
        query[key] = isNaN(filters[key]) ? filters[key] : Number(filters[key]);
      }
    });

    // Date range filter on timestamp
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = new Date(from);
      if (to) query.timestamp.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      ActivityLog.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(Number(limit)),
      ActivityLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Data retrieved successfully',
      data: { items: data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * GET /api/activity-logs/:id
 */
const getOne = async (req, res) => {
  try {
    const doc = await ActivityLog.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Data retrieved successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * POST /api/activity-logs
 * Create a new activity log entry for the authenticated user.
 */
const create = async (req, res) => {
  try {
    const body = {
      ...req.body,
      userId: req.user.id,
      timestamp: req.body.timestamp || new Date(),
    };
    const doc = await ActivityLog.create(body);
    res.status(201).json({ success: true, message: 'Created successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * PUT /api/activity-logs/:id
 */
const update = async (req, res) => {
  try {
    const doc = await ActivityLog.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Updated successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * DELETE /api/activity-logs/:id
 */
const deleteOne = async (req, res) => {
  try {
    const doc = await ActivityLog.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Deleted successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * DELETE /api/activity-logs
 * Clear all activity logs for the authenticated user.
 */
const clearAll = async (req, res) => {
  try {
    const result = await ActivityLog.deleteMany({ userId: req.user.id });
    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} activity logs`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = { getAll, getOne, create, update, deleteOne, clearAll };
