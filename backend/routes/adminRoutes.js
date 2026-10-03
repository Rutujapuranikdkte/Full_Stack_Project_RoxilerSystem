const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middleware/authMiddleware');
const { validateUserData, validateStoreData } = require('../middleware/validationMiddleware');

// All admin routes require ADMIN role
router.use(verifyToken, requireRole('ADMIN'));

router.get('/dashboard-stats', adminController.getDashboardStats);
router.post('/users', validateUserData, adminController.addUser);
router.post('/stores', validateStoreData, adminController.addStore);
router.get('/users', adminController.getUsers);
router.get('/stores', adminController.getStores);
router.get('/store-owners', adminController.getStoreOwners);

module.exports = router;
