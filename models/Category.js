const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    /**
     * Reference to the owner user.
     * null means this is a GLOBAL default category visible to everyone.
     */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    /** Category display name */
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    /** Material icon code point */
    iconCode: {
      type: Number,
      required: [true, 'Icon code is required'],
    },
    /** Icon font family (e.g. MaterialIcons) */
    iconFamily: {
      type: String,
      default: 'MaterialIcons',
    },
    /** Icon font package */
    iconPackage: {
      type: String,
      default: null,
    },
    /** Color integer value */
    colorValue: {
      type: Number,
      required: [true, 'Color value is required'],
    },
    /** Whether this category requires premium access */
    isPremiumOnly: {
      type: Boolean,
      default: false,
    },
    /** Whether this category is currently locked */
    isLocked: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether this is a global default category.
     * true  = visible to ALL users (seeded by the system)
     * false = user-created, only visible to the owning userId
     */
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

categorySchema.index({ userId: 1 });
categorySchema.index({ isDefault: 1 });

module.exports = mongoose.model('Category', categorySchema);
