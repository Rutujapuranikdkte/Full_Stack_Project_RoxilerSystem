const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { validateRating } = require('../middleware/validationMiddleware');

// Normal users submit or modify rating
router.post('/', verifyToken, requireRole('USER'), validateRating, ratingController.submitOrUpdateRating);

// Store owners view ratings submitted for their store
router.get('/owner-dashboard', verifyToken, requireRole('OWNER'), ratingController.getOwnerDashboard);

module.exports = router;
