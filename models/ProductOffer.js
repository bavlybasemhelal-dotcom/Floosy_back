const mongoose = require('mongoose');

const productOfferSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, default: '' },
    originalPrice: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, required: true, min: 0 },
    cashbackPercentage: { type: Number, default: 0, min: 0, max: 100 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },
    storeName: { type: String, required: true },
    category: { type: String, required: true },
    isAsset: { type: Boolean, default: false },
    /** Whether this offer is currently active/visible */
    isActive: { type: Boolean, default: true },
    /** Optional description for the offer */
    description: { type: String, default: '' },
    /** URL to the store/product page */
    storeUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

productOfferSchema.index({ category: 1, isActive: 1 });
productOfferSchema.index({ rating: -1 });
productOfferSchema.index({ cashbackPercentage: -1 });
module.exports = mongoose.model('ProductOffer', productOfferSchema);
