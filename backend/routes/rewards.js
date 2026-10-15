// backend/routes/rewards.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getMyRewards } = require('../controllers/rewardsController');

router.get('/my', authMiddleware, getMyRewards);

module.exports = router;
