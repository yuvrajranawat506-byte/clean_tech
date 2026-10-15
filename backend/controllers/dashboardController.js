// backend/controllers/dashboardController.js
const { pool } = require('../config/db');

// GET /api/dashboard/user — user's personal stats
async function getUserDashboard(req, res, next) {
  try {
    const userId = req.user.id;

    // Total pickups
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM pickups WHERE user_id = ?', [userId]
    );

    // Pending pickups
    const [[{ pending }]] = await pool.query(
      "SELECT COUNT(*) as pending FROM pickups WHERE user_id = ? AND status = 'pending'", [userId]
    );

    // Total collected kg (only from 'collected' pickups)
    const [[{ collected_kg }]] = await pool.query(
      "SELECT COALESCE(SUM(quantity_kg), 0) as collected_kg FROM pickups WHERE user_id = ? AND status = 'collected'", [userId]
    );

    // Total reward points
    const [[{ points }]] = await pool.query(
      'SELECT COALESCE(SUM(points), 0) as points FROM rewards WHERE user_id = ?', [userId]
    );

    // Recent pickups (last 5)
    const [recentPickups] = await pool.query(
      'SELECT * FROM pickups WHERE user_id = ? ORDER BY created_at DESC LIMIT 5', [userId]
    );

    // Monthly waste collection chart (last 6 months, collected only)
    const [monthlyData] = await pool.query(
      `SELECT 
        DATE_FORMAT(pickup_date, '%Y-%m') as month,
        DATE_FORMAT(pickup_date, '%b %Y') as label,
        COALESCE(SUM(quantity_kg), 0) as total_kg
       FROM pickups 
       WHERE user_id = ? AND status = 'collected' 
         AND pickup_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(pickup_date, '%Y-%m'), DATE_FORMAT(pickup_date, '%b %Y')
       ORDER BY month ASC`,
      [userId]
    );

    // Waste breakdown by type (collected only)
    const [wasteBreakdown] = await pool.query(
      `SELECT waste_type, COALESCE(SUM(quantity_kg), 0) as kg
       FROM pickups WHERE user_id = ? AND status = 'collected'
       GROUP BY waste_type`,
      [userId]
    );

    res.json({
      success: true,
      stats: {
        total_pickups: total,
        pending_pickups: pending,
        collected_kg: parseFloat(collected_kg),
        reward_points: points,
      },
      recentPickups,
      monthlyData,
      wasteBreakdown,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/admin — admin overview stats
async function getAdminDashboard(req, res, next) {
  try {
    // Total users
    const [[{ totalUsers }]] = await pool.query("SELECT COUNT(*) as totalUsers FROM users WHERE role = 'user'");

    // Total pickups and by status
    const [statusCounts] = await pool.query(
      `SELECT status, COUNT(*) as count FROM pickups GROUP BY status`
    );
    const statusMap = {};
    statusCounts.forEach(r => { statusMap[r.status] = r.count; });

    // Total collected kg
    const [[{ totalCollectedKg }]] = await pool.query(
      "SELECT COALESCE(SUM(quantity_kg), 0) as totalCollectedKg FROM pickups WHERE status = 'collected'"
    );

    // Waste by category
    const [wasteByCategory] = await pool.query(
      `SELECT waste_type, COALESCE(SUM(quantity_kg), 0) as kg, COUNT(*) as count
       FROM pickups GROUP BY waste_type`
    );

    // Monthly collected waste (last 6 months)
    const [monthlyData] = await pool.query(
      `SELECT 
        DATE_FORMAT(pickup_date, '%Y-%m') as month,
        DATE_FORMAT(pickup_date, '%b %Y') as label,
        COALESCE(SUM(quantity_kg), 0) as total_kg
       FROM pickups 
       WHERE status = 'collected' 
         AND pickup_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(pickup_date, '%Y-%m'), DATE_FORMAT(pickup_date, '%b %Y')
       ORDER BY month ASC`
    );

    // Recent pickups (last 10 with user name)
    const [recentPickups] = await pool.query(
      `SELECT p.*, u.name as user_name, u.email as user_email
       FROM pickups p JOIN users u ON p.user_id = u.id
       ORDER BY p.created_at DESC LIMIT 10`
    );

    res.json({
      success: true,
      stats: {
        total_users: totalUsers,
        total_pickups: Object.values(statusMap).reduce((a, b) => a + b, 0),
        pending_pickups: statusMap.pending || 0,
        approved_pickups: statusMap.approved || 0,
        collected_pickups: statusMap.collected || 0,
        rejected_pickups: statusMap.rejected || 0,
        cancelled_pickups: statusMap.cancelled || 0,
        total_collected_kg: parseFloat(totalCollectedKg),
      },
      wasteByCategory,
      monthlyData,
      recentPickups,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getUserDashboard, getAdminDashboard };
