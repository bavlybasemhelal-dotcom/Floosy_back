const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    /** User's full display name */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    /** Unique email address used for authentication */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    /** Hashed password (bcrypt) */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    /** Phone number */
    phone: {
      type: String,
      default: '',
    },
    /** Geographic location (country/city) */
    location: {
      type: String,
      default: '',
    },
    /** Local file path for profile picture */
    profilePicture: {
      type: String,
      default: null,
    },
    /** Remote URL for profile picture (e.g. Supabase) */
    profilePictureUrl: {
      type: String,
      default: null,
    },
    /** User preferences (UI settings, onboarding status, etc.) */
    preferences: {
      darkMode: { type: Boolean, default: false },
      themeMode: { type: String, default: 'Living Ecosystem' },
      currencySymbol: { type: String, default: 'EGP' },
      defaultExportFormat: { type: String, default: 'pdf' },
      isOnboarded: { type: Boolean, default: false },
      hasViewedOnboarding: { type: Boolean, default: false },
      trialDismissed: { type: Boolean, default: false },
      lastSavingsNotificationMonth: { type: String, default: '' },
      lastSpendingNotificationMonth: { type: String, default: '' },
      selectedDashboardWidgets: { type: [String], default: [] }
    }
  },
  { timestamps: true }
);


module.exports = mongoose.model('User', userSchema);
