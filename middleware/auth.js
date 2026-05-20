const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware.
 * Verifies Bearer token from the Authorization header.
 * Attaches decoded user payload to req.user on success.
 */
const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
        data: null,
      });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    if (req.user && !req.user.id) {
      req.user.id = req.user._id || req.user.userId;
    }
    
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
        data: null,
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      data: null,
    });
  }
};

module.exports = auth;
