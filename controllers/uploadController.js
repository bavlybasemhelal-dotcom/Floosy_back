const User = require('../models/User');

/**
 * POST /api/upload/save-url
 * Save an image URL (uploaded externally to Supabase) to the database.
 *
 * Body: { imageUrl: "https://...", type: "profile" }
 *
 * Mirrors Flutter: edit_profile_page.dart _saveChanges() →
 *   SupabaseStorageService.uploadProfilePicture() returns URL →
 *   saved to SharedPreferences as 'profile_image_url'
 *
 * This endpoint persists the Supabase URL server-side so it survives
 * device changes and is available via GET /api/users/me.
 */
const saveUrl = async (req, res) => {
  try {
    const { imageUrl, type } = req.body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'imageUrl is required and must be a string',
        data: null,
      });
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      return res.status(400).json({
        success: false,
        message: 'Invalid URL format',
        data: null,
      });
    }

    if (!type || typeof type !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'type is required (e.g. "profile")',
        data: null,
      });
    }

    if (type === 'profile') {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { profilePictureUrl: imageUrl },
        { new: true, runValidators: true }
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
          data: null,
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Profile image URL saved',
        data: { imageUrl: user.profilePictureUrl, type },
      });
    }

    return res.status(400).json({
      success: false,
      message: `Unsupported upload type: "${type}". Supported: "profile"`,
      data: null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null });
  }
};

module.exports = { saveUrl };
