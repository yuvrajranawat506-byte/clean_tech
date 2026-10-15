// backend/routes/users.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { updateProfile, changePassword } = require('../controllers/usersController');

const profileValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('address').optional().isLength({ max: 500 }),
];

const passwordValidation = [
  body('current_password').notEmpty().withMessage('Current password is required'),
  body('new_password').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
];

router.use(authMiddleware);
router.patch('/profile', profileValidation, updateProfile);
router.patch('/password', passwordValidation, changePassword);

module.exports = router;
