const DashboardWidget = require('../models/DashboardWidget');

/**
 * GET /api/dashboard-widgets
 * Retrieve the user's dashboard widget configuration.
 * Auto-creates a default document if none exists (upsert pattern).
 * Returns the data in a format compatible with the Flutter service
 * which expects { data: { items: [...] } } from getAll().
 */
const getWidgets = async (req, res) => {
  try {
    let doc = await DashboardWidget.findOne({ userId: req.user.id });
    if (!doc) {
      doc = await DashboardWidget.create({ userId: req.user.id });
    }
    // Return in list format to match Flutter's DashboardWidgetsService.getAll()
    res.status(200).json({
      success: true,
      message: 'Dashboard widgets retrieved',
      data: {
        items: [doc],
        total: 1,
        page: 1,
        limit: 1,
        totalPages: 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * GET /api/dashboard-widgets/:id
 * Retrieve a specific dashboard widget config by ID.
 */
const getOne = async (req, res) => {
  try {
    const doc = await DashboardWidget.findOne({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Data retrieved successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * POST /api/dashboard-widgets
 * Create a new dashboard widget configuration.
 * Uses upsert to prevent duplicate userId errors.
 */
const create = async (req, res) => {
  try {
    const doc = await DashboardWidget.findOneAndUpdate(
      { userId: req.user.id },
      { ...req.body, userId: req.user.id },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json({ success: true, message: 'Created successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * PUT /api/dashboard-widgets
 * Update the user's dashboard widget configuration (no ID needed).
 * This is the primary update endpoint — upserts by userId.
 */
const updateWidgets = async (req, res) => {
  try {
    const doc = await DashboardWidget.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true, runValidators: true, upsert: true }
    );
    res.status(200).json({ success: true, message: 'Dashboard widgets updated', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * PUT /api/dashboard-widgets/:id
 * Update a specific dashboard widget config by ID.
 */
const update = async (req, res) => {
  try {
    const doc = await DashboardWidget.findOneAndUpdate(
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
 * DELETE /api/dashboard-widgets/:id
 * Delete a specific dashboard widget config.
 */
const deleteOne = async (req, res) => {
  try {
    const doc = await DashboardWidget.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Deleted successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = {
  getAll: getWidgets,
  getOne,
  create,
  update,
  updateWidgets,
  deleteOne,
};
