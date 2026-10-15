// backend/controllers/rewardsController.js
const { pool } = require('../config/db');

// GET /api/rewards/my — get current user's reward points and history
async function getMyRewards(req, res, next) {
  try {
    const userId = req.user.id;

    // Total points
    const [[{ total_points }]] = await pool.query(
      'SELECT COALESCE(SUM(points), 0) as total_points FROM rewards WHERE user_id = ?',
      [userId]
    );

    // Reward history (with pickup details)
    const [history] = await pool.query(
      `SELECT r.*, p.waste_type, p.quantity_kg 
       FROM rewards r
       LEFT JOIN pickups p ON r.pickup_id = p.id
       WHERE r.user_id = ?
       ORDER BY r.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      total_points: parseInt(total_points),
      history,
      // Voucher tiers for display (demo only — no real monetary value)
      vouchers: [
        { name: 'Eco Starter', points_required: 100, description: '5% discount at partner stores (demo)' },
        { name: 'Green Warrior', points_required: 500, description: '10% discount at partner stores (demo)' },
        { name: 'Planet Hero', points_required: 1000, description: 'Free eco-product (demo)' },
      ],
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyRewards };
