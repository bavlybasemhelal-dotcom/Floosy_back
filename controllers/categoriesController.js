const Category = require('../models/Category');
const { resolveWalletOwner } = require('../middleware/resolveOwner');

/**
 * Default categories to seed if none exist.
 * These are GLOBAL — visible to every user.
 *
 * Icon codes reference Flutter's MaterialIcons font:
 *   Icons.shopping_bag       = 0xf37d
 *   Icons.restaurant         = 0xe532
 *   Icons.directions_car     = 0xe1d7
 *   Icons.receipt_long        = 0xef6b
 *   Icons.movie              = 0xe40f
 *   Icons.category           = 0xe148
 *   Icons.flag               = 0xe249
 *   Icons.trending_up        = 0xe5d8
 *   Icons.flight_takeoff     = 0xe241
 *   Icons.business_center    = 0xe0af
 *   Icons.fitness_center     = 0xe23a
 */
const DEFAULT_CATEGORIES = [
  {
    name: 'Shopping',
    iconCode: 0xf37d,
    iconFamily: 'MaterialIcons',
    colorValue: 0xFF4CAF50,
    isPremiumOnly: false,
    isLocked: false,
    isDefault: true,
  },
  {
    name: 'Food',
    iconCode: 0xe532,
    iconFamily: 'MaterialIcons',
    colorValue: 0xFFFF9800,
    isPremiumOnly: false,
    isLocked: false,
    isDefault: true,
  },
  {
    name: 'Transport',
    iconCode: 0xe1d7,
    iconFamily: 'MaterialIcons',
    colorValue: 0xFF2196F3,
    isPremiumOnly: false,
    isLocked: false,
    isDefault: true,
  },
  {
    name: 'Bills & Subscriptions',
    iconCode: 0xef6b,
    iconFamily: 'MaterialIcons',
    colorValue: 0xFFFFC107,
    isPremiumOnly: false,
    isLocked: false,
    isDefault: true,
  },
  {
    name: 'Entertainment',
    iconCode: 0xe40f,
    iconFamily: 'MaterialIcons',
    colorValue: 0xFF9C27B0,
    isPremiumOnly: false,
    isLocked: false,
    isDefault: true,
  },
  {
    name: 'Others',
    iconCode: 0xe148,
    iconFamily: 'MaterialIcons',
    colorValue: 0xFF607D8B,
    isPremiumOnly: false,
    isLocked: false,
    isDefault: true,
  },
  {
    name: 'Goals',
    iconCode: 0xe249,
    iconFamily: 'MaterialIcons',
    colorValue: 0xFF00ACC1,
    isPremiumOnly: false,
    isLocked: false,
    isDefault: true,
  },
  // ── Premium Categories ───────────────────────
  {
    name: 'Investment',
    iconCode: 0xe5d8,
    iconFamily: 'MaterialIcons',
    colorValue: 0xFF2E7D32,
    isPremiumOnly: true,
    isLocked: true,
    isDefault: true,
  },
  {
    name: 'Travel',
    iconCode: 0xe241,
    iconFamily: 'MaterialIcons',
    colorValue: 0xFF2196F3,
    isPremiumOnly: true,
    isLocked: true,
    isDefault: true,
  },
  {
    name: 'Business',
    iconCode: 0xe0af,
    iconFamily: 'MaterialIcons',
    colorValue: 0xFF3F51B5,
    isPremiumOnly: true,
    isLocked: true,
    isDefault: true,
  },
  {
    name: 'Fitness',
    iconCode: 0xe23a,
    iconFamily: 'MaterialIcons',
    colorValue: 0xFFE91E63,
    isPremiumOnly: true,
    isLocked: true,
    isDefault: true,
  },
];

/**
 * Seed default categories if none with isDefault=true exist.
 * Called once on module load (server startup).
 */
const seedDefaults = async () => {
  try {
    const count = await Category.countDocuments({ isDefault: true });
    if (count === 0) {
      await Category.insertMany(DEFAULT_CATEGORIES);
      console.log(`📂 Seeded ${DEFAULT_CATEGORIES.length} default categories`);
    }
  } catch (error) {
    console.error('Error seeding default categories:', error.message);
  }
};

// Seed on module load
seedDefaults();

/**
 * GET /api/categories
 *
 * Returns:
 *   1. All GLOBAL default categories (isDefault: true)
 *   2. PLUS the current user's custom categories (userId = effectiveOwner)
 *
 * This way every user sees the defaults + only their own custom ones.
 */
const getAll = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    const { page = 1, limit = 100, sortBy = 'createdAt', order = 'asc' } = req.query;

    // Query: defaults (isDefault=true) OR user's own (userId=owner & isDefault=false)
    const query = {
      $or: [
        { isDefault: true },
        { userId: effectiveOwner, isDefault: false },
      ],
    };

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      Category.find(query).sort({ isDefault: -1, [sortBy]: sortOrder }).skip(skip).limit(Number(limit)),
      Category.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      message: 'Data retrieved successfully',
      data: {
        items: data,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * GET /api/categories/:id
 */
const getOne = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    // Allow fetching if it's a default OR belongs to the user
    const doc = await Category.findOne({
      _id: req.params.id,
      $or: [
        { isDefault: true },
        { userId: effectiveOwner },
      ],
    });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Data retrieved successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * POST /api/categories
 * Creates a USER-SPECIFIC category (isDefault = false, userId = current user).
 */
const create = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    const body = {
      ...req.body,
      userId: effectiveOwner,
      isDefault: false, // User-created categories are NEVER default
    };
    const doc = await Category.create(body);
    res.status(201).json({ success: true, message: 'Created successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * PUT /api/categories/:id
 * Only allow editing user-created categories (not defaults).
 */
const update = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    const doc = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: effectiveOwner, isDefault: false },
      req.body,
      { new: true, runValidators: true }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Not found or cannot edit default category', data: null });
    res.status(200).json({ success: true, message: 'Updated successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * DELETE /api/categories/:id
 * Only allow deleting user-created categories (not defaults).
 */
const deleteOne = async (req, res) => {
  try {
    const effectiveOwner = await resolveWalletOwner(req.user.id);
    const doc = await Category.findOneAndDelete(
      { _id: req.params.id, userId: effectiveOwner, isDefault: false }
    );
    if (!doc) return res.status(404).json({ success: false, message: 'Not found or cannot delete default category', data: null });
    res.status(200).json({ success: true, message: 'Deleted successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = { getAll, getOne, create, update, deleteOne };
