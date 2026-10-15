// backend/routes/dashboard.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { getUserDashboard, getAdminDashboard } = require('../controllers/dashboardController');

router.get('/user', authMiddleware, getUserDashboard);
router.get('/admin', authMiddleware, adminMiddleware, getAdminDashboard);

module.exports = router;
