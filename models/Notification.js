const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    /** Reference to the owner user */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Notification title */
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    /** Full notification description */
    description: {
      type: String,
      default: '',
    },
    /** Display time label (e.g. "Just now") */
    time: {
      type: String,
      default: 'Just now',
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
    /** Whether the notification has been read */
    isRead: {
      type: Boolean,
      default: false,
    },
    /** Actual timestamp of creation */
    timestamp: {
      type: Date,
      default: Date.now,
    },
    /** Notification type (e.g. invitation, regular) */
    type: {
      type: String,
      default: 'regular',
    },
    /** Extra metadata (flexible key-value store) */
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
