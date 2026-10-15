// backend/routes/pickups.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middleware/auth');
const { createPickup, getMyPickups, getPickupById, cancelPickup } = require('../controllers/pickupsController');

const pickupValidation = [
  body('waste_type').isIn(['wet_waste', 'dry_waste', 'plastic', 'e_waste']).withMessage('Invalid waste type'),
  body('quantity_kg').isFloat({ min: 0.1, max: 1000 }).withMessage('Quantity must be between 0.1 and 1000 kg'),
  body('pickup_address').trim().notEmpty().withMessage('Pickup address is required'),
  body('pickup_date').isDate().withMessage('Valid pickup date is required'),
  body('pickup_time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid pickup time is required (HH:MM)'),
  body('instructions').optional().isLength({ max: 500 }).withMessage('Instructions cannot exceed 500 characters'),
];

router.use(authMiddleware); // All pickup routes require authentication

router.post('/', pickupValidation, createPickup);
router.get('/my', getMyPickups);
router.get('/:id', getPickupById);
router.patch('/:id/cancel', cancelPickup);

module.exports = router;
