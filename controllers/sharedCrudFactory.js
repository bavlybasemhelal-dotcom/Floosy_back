const { resolveWalletOwner } = require('../middleware/resolveOwner');

/**
 * Shared-wallet-aware CRUD controller factory.
 * 
 * Works exactly like buildCrudController but resolves the effective
 * wallet owner before every operation. This means linked shared members
 * automatically see and operate on the primary wallet owner's data.
 *
 * Use this for any Model whose data should be shared across
 * linked wallet accounts (expenses, categories, bills, goals, etc.).
 */
const buildSharedCrudController = (Model, { ownerField = 'userId' } = {}) => {
  const getAll = async (req, res) => {
    try {
      const effectiveOwner = await resolveWalletOwner(req.user.id);
      const { page = 1, limit = 10, sortBy = 'createdAt', order = 'desc', from, to, ...filters } = req.query;

      const query = { [ownerField]: effectiveOwner };

      // Apply filters
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== '') {
          query[key] = isNaN(filters[key]) ? filters[key] : Number(filters[key]);
        }
      });

      // Date range
      if (from || to) {
        query.createdAt = {};
        if (from) query.createdAt.$gte = new Date(from);
        if (to) query.createdAt.$lte = new Date(to);
      }

      const skip = (Number(page) - 1) * Number(limit);
      const sortOrder = order === 'asc' ? 1 : -1;

      const [data, total] = await Promise.all([
        Model.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(Number(limit)),
        Model.countDocuments(query),
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

  const getOne = async (req, res) => {
    try {
      const effectiveOwner = await resolveWalletOwner(req.user.id);
      const doc = await Model.findOne({ _id: req.params.id, [ownerField]: effectiveOwner });
      if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
      res.status(200).json({ success: true, message: 'Data retrieved successfully', data: doc });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message, data: null });
    }
  };

  const create = async (req, res) => {
    try {
      const effectiveOwner = await resolveWalletOwner(req.user.id);
      const body = { ...req.body, [ownerField]: effectiveOwner };
      const doc = await Model.create(body);
      res.status(201).json({ success: true, message: 'Created successfully', data: doc });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message, data: null });
    }
  };

  const update = async (req, res) => {
    try {
      const effectiveOwner = await resolveWalletOwner(req.user.id);
      const doc = await Model.findOneAndUpdate(
        { _id: req.params.id, [ownerField]: effectiveOwner },
        req.body,
        { new: true, runValidators: true }
      );
      if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
      res.status(200).json({ success: true, message: 'Updated successfully', data: doc });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message, data: null });
    }
  };

  const deleteOne = async (req, res) => {
    try {
      const effectiveOwner = await resolveWalletOwner(req.user.id);
      const doc = await Model.findOneAndDelete({ _id: req.params.id, [ownerField]: effectiveOwner });
      if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
      res.status(200).json({ success: true, message: 'Deleted successfully', data: doc });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message, data: null });
    }
  };

  return { getAll, getOne, create, update, deleteOne };
};

module.exports = buildSharedCrudController;
