const ProductOffer = require('../models/ProductOffer');

/**
 * Default product offers to seed if the collection is empty.
 * These match the Flutter hardcoded data exactly so the UI renders correctly.
 */
const DEFAULT_OFFERS = [
  {
    title: 'iPhone 15 Pro Max - 256GB Titanium',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop',
    originalPrice: 85000,
    discountedPrice: 79999,
    cashbackPercentage: 2.0,
    rating: 4.9,
    reviewsCount: 1540,
    storeName: 'TradeLine',
    category: 'Electronics',
  },
  {
    title: 'Samsung 55" QLED 4K Smart TV',
    imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop',
    originalPrice: 32000,
    discountedPrice: 24999,
    cashbackPercentage: 5.0,
    rating: 4.7,
    reviewsCount: 890,
    storeName: 'B.TECH',
    category: 'Electronics',
  },
  {
    title: 'Sony PlayStation 5 Slim Console',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=800&auto=format&fit=crop',
    originalPrice: 35000,
    discountedPrice: 29900,
    cashbackPercentage: 0.0,
    rating: 4.8,
    reviewsCount: 2100,
    storeName: 'Amazon Egypt',
    category: 'Electronics',
  },
  {
    title: 'Nespresso Vertuo Pop Coffee Machine',
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?q=80&w=800&auto=format&fit=crop',
    originalPrice: 9500,
    discountedPrice: 7800,
    cashbackPercentage: 8.0,
    rating: 4.6,
    reviewsCount: 450,
    storeName: 'Nespresso',
    category: 'Home & Living',
  },
  {
    title: 'Dyson V15 Detect Cordless Vacuum',
    imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=800&auto=format&fit=crop',
    originalPrice: 48000,
    discountedPrice: 42500,
    cashbackPercentage: 3.0,
    rating: 4.9,
    reviewsCount: 1200,
    storeName: 'Amazon Egypt',
    category: 'Home & Living',
  },
  {
    title: 'Nike Air Max 270 - White/Black',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
    originalPrice: 8500,
    discountedPrice: 6200,
    cashbackPercentage: 10.0,
    rating: 4.7,
    reviewsCount: 3200,
    storeName: 'Nike Store',
    category: 'Fashion',
  },
  {
    title: 'Ray-Ban Classic Aviator Sunglasses',
    imageUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
    originalPrice: 7200,
    discountedPrice: 5400,
    cashbackPercentage: 15.0,
    rating: 4.8,
    reviewsCount: 840,
    storeName: 'Magrabi',
    category: 'Fashion',
  },
  {
    title: 'Samsonite Hard-Shell Carry-On Luggage',
    imageUrl: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?q=80&w=800&auto=format&fit=crop',
    originalPrice: 12000,
    discountedPrice: 9900,
    cashbackPercentage: 5.0,
    rating: 4.7,
    reviewsCount: 560,
    storeName: 'Samsonite',
    category: 'Travel',
  },
  {
    title: 'Lavazza Super Crema Whole Bean Coffee',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
    originalPrice: 1200,
    discountedPrice: 950,
    cashbackPercentage: 20.0,
    rating: 4.9,
    reviewsCount: 12400,
    storeName: 'Gourmet',
    category: 'Groceries',
  },
];

/**
 * Seed default offers if the collection is empty.
 * Called once on server startup.
 */
const seedDefaults = async () => {
  try {
    const count = await ProductOffer.countDocuments();
    if (count === 0) {
      await ProductOffer.insertMany(DEFAULT_OFFERS);
      console.log(`📦 Seeded ${DEFAULT_OFFERS.length} default product offers`);
    }
  } catch (error) {
    console.error('Error seeding product offers:', error.message);
  }
};

// Seed on module load
seedDefaults();

/**
 * GET /api/product-offers
 * List all product offers (global — no userId scoping).
 * Supports filtering by category, cashback, rating, pagination, etc.
 */
const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 50, sortBy = 'createdAt', order = 'desc', category, minCashback, minRating, ...filters } = req.query;

    const query = { isActive: { $ne: false } };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Minimum cashback filter
    if (minCashback) {
      query.cashbackPercentage = { $gte: Number(minCashback) };
    }

    // Minimum rating filter
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    // Apply any additional filters
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== undefined && filters[key] !== '') {
        query[key] = isNaN(filters[key]) ? filters[key] : Number(filters[key]);
      }
    });

    const skip = (Number(page) - 1) * Number(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [data, total] = await Promise.all([
      ProductOffer.find(query).sort({ [sortBy]: sortOrder }).skip(skip).limit(Number(limit)),
      ProductOffer.countDocuments(query),
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
 * GET /api/product-offers/:id
 */
const getOne = async (req, res) => {
  try {
    const doc = await ProductOffer.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Data retrieved successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * POST /api/product-offers
 */
const create = async (req, res) => {
  try {
    const doc = await ProductOffer.create(req.body);
    res.status(201).json({ success: true, message: 'Created successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * PUT /api/product-offers/:id
 */
const update = async (req, res) => {
  try {
    const doc = await ProductOffer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Updated successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

/**
 * DELETE /api/product-offers/:id
 */
const deleteOne = async (req, res) => {
  try {
    const doc = await ProductOffer.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found', data: null });
    res.status(200).json({ success: true, message: 'Deleted successfully', data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = { getAll, getOne, create, update, deleteOne };
