const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const storeController = require('../controllers/storeController');

// Optional auth helper so logged-in users see their specific submitted rating
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_store_rating_jwt_key_2026_x!$9');
      req.user = decoded;
    } catch (err) {
      // Silently proceed as guest if token expired or invalid
    }
  }
  next();
};

router.get('/', optionalAuth, storeController.getAllStores);

module.exports = router;
