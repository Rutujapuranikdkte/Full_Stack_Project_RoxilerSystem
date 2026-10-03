const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');
const { validateUserData, validatePasswordUpdate } = require('../middleware/validationMiddleware');

// Public routes
router.post('/register', validateUserData, authController.register);
router.post('/login', authController.login);

// Protected routes (any logged-in user)
router.get('/me', verifyToken, authController.getMe);
router.put('/update-password', verifyToken, validatePasswordUpdate, authController.updatePassword);

module.exports = router;
