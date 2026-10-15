// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');
const { getAllPickups, updatePickupStatus, getAllUsers } = require('../controllers/adminController');

// All admin routes require both auth + admin role
router.use(authMiddleware, adminMiddleware);

router.get('/pickups', getAllPickups);
router.patch(
  '/pickups/:id/status',
  [body('status').isIn(['approved', 'rejected', 'collected']).withMessage('Invalid status value')],
  updatePickupStatus
);
router.get('/users', getAllUsers);

module.exports = router;
