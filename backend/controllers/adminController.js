// backend/controllers/adminController.js
// Admin-only controller: manage pickups, award rewards, view users
const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

// Points awarded per kg for each waste type (demo rule — documented)
const POINTS_PER_KG = {
  wet_waste: 10,
  dry_waste: 10,
  plastic: 10,
  e_waste: 20, // e-waste is harder to process, more points
};

// Valid status transitions (prevents invalid changes)
const VALID_TRANSITIONS = {
  pending: ['approved', 'rejected'],
  approved: ['collected', 'rejected'],
  collected: [],  // terminal state
  rejected: [],   // terminal state
  cancelled: [],  // terminal state
};

// GET /api/admin/pickups — list all pickups with filters
async function getAllPickups(req, res, next) {
  try {
    const { status, waste_type, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT p.*, u.name as user_name, u.email as user_email, u.phone as user_phone
      FROM pickups p JOIN users u ON p.user_id = u.id WHERE 1=1
    `;
    const params = [];

    if (status) { query += ' AND p.status = ?'; params.push(status); }
    if (waste_type) { query += ' AND p.waste_type = ?'; params.push(waste_type); }
    if (search) {
      query += ' AND (u.name LIKE ? OR u.email LIKE ? OR p.pickup_address LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // Count
    let countQuery = query.replace(
      'SELECT p.*, u.name as user_name, u.email as user_email, u.phone as user_phone',
      'SELECT COUNT(*) as total'
    );
    const [[{ total }]] = await pool.query(countQuery, params);

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [pickups] = await pool.query(query, params);

    res.json({ success: true, pickups, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/admin/pickups/:id/status — update pickup status (with reward allocation)
async function updatePickupStatus(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      conn.release();
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { status } = req.body;
    const pickupId = req.params.id;

    await conn.beginTransaction();

    // Fetch pickup with lock
    const [rows] = await conn.query('SELECT * FROM pickups WHERE id = ? FOR UPDATE', [pickupId]);
    if (rows.length === 0) {
      await conn.rollback();
      conn.release();
      return res.status(404).json({ success: false, message: 'Pickup not found.' });
    }

    const pickup = rows[0];

    // Check valid transition
    const allowed = VALID_TRANSITIONS[pickup.status] || [];
    if (!allowed.includes(status)) {
      await conn.rollback();
      conn.release();
      return res.status(400).json({
        success: false,
        message: `Cannot change status from "${pickup.status}" to "${status}". Allowed: [${allowed.join(', ') || 'none'}]`,
      });
    }

    // Update status
    await conn.query("UPDATE pickups SET status = ? WHERE id = ?", [status, pickupId]);

    // Award reward points if newly collected (prevent duplicates via UNIQUE constraint on pickup_id)
    if (status === 'collected') {
      const pointsPerKg = POINTS_PER_KG[pickup.waste_type] || 10;
      const points = Math.round(pickup.quantity_kg * pointsPerKg);
      const description = `Points for collecting ${pickup.quantity_kg} kg of ${pickup.waste_type.replace('_', ' ')} (${pointsPerKg} pts/kg)`;

      try {
        await conn.query(
          'INSERT INTO rewards (user_id, points, description, pickup_id) VALUES (?, ?, ?, ?)',
          [pickup.user_id, points, description, pickupId]
        );
      } catch (dupErr) {
        if (dupErr.code === 'ER_DUP_ENTRY') {
          // Reward already credited — this is fine, just skip
          console.log(`Reward already credited for pickup #${pickupId}`);
        } else {
          throw dupErr;
        }
      }
    }

    await conn.commit();
    conn.release();

    res.json({ success: true, message: `Pickup status updated to "${status}" successfully.` });
  } catch (err) {
    await conn.rollback();
    conn.release();
    next(err);
  }
}

// GET /api/admin/users — list all users
async function getAllUsers(req, res, next) {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT id, name, email, phone, address, role, created_at FROM users WHERE 1=1';
    const params = [];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    const [[{ total }]] = await pool.query(
      query.replace('SELECT id, name, email, phone, address, role, created_at', 'SELECT COUNT(*) as total'),
      params
    );

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [users] = await pool.query(query, params);

    // Get pickup count and points for each user
    const enriched = await Promise.all(users.map(async (u) => {
      const [[{ pickups }]] = await pool.query('SELECT COUNT(*) as pickups FROM pickups WHERE user_id = ?', [u.id]);
      const [[{ points }]] = await pool.query('SELECT COALESCE(SUM(points), 0) as points FROM rewards WHERE user_id = ?', [u.id]);
      return { ...u, total_pickups: pickups, reward_points: parseInt(points) };
    }));

    res.json({ success: true, users: enriched, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAllPickups, updatePickupStatus, getAllUsers };
