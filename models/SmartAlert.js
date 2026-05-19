const mongoose = require('mongoose');

const smartAlertSchema = new mongoose.Schema(
  {
    /** Reference to the owner user */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Alert title */
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    /** Alert description */
    description: {
      type: String,
      default: '',
    },
    /** Material icon code point */
    icon: {
      type: Number,
      default: 0,
    },
    /** Color integer value */
    color: {
      type: Number,
      default: 0xFF000000,
    },
    /** Whether the alert is active */
    isActive: {
      type: Boolean,
      default: true,
    },
    /** Alert type (e.g. Smart Alert, Invitation) */
    type: {
      type: String,
      required: [true, 'Type is required'],
    },
    /** Whether this is a priority alert */
    isPriority: {
      type: Boolean,
      default: false,
    },
    /** Extra metadata (flexible key-value store) */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    /** Associated category name */
    category: {
      type: String,
      default: null,
    },
    /** Threshold value that triggered the alert */
    threshold: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

smartAlertSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('SmartAlert', smartAlertSchema);
