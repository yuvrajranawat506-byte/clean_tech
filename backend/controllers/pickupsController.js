// backend/controllers/pickupsController.js
const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

const ALLOWED_WASTE_TYPES = ['wet_waste', 'dry_waste', 'plastic', 'e_waste'];
const CANCELLABLE_STATUSES = ['pending'];

// POST /api/pickups — schedule a new pickup
async function createPickup(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { waste_type, quantity_kg, pickup_address, pickup_date, pickup_time, instructions } = req.body;

    // Validate waste type
    if (!ALLOWED_WASTE_TYPES.includes(waste_type)) {
      return res.status(400).json({ success: false, message: 'Invalid waste type.' });
    }

    // Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(pickup_date);
    if (selectedDate < today) {
      return res.status(400).json({ success: false, message: 'Pickup date cannot be in the past.' });
    }

    const [result] = await pool.query(
      `INSERT INTO pickups (user_id, waste_type, quantity_kg, pickup_address, pickup_date, pickup_time, instructions, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, waste_type, quantity_kg, pickup_address, pickup_date, pickup_time, instructions || null]
    );

    const [newPickup] = await pool.query('SELECT * FROM pickups WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, message: 'Pickup scheduled successfully!', pickup: newPickup[0] });
  } catch (err) {
    next(err);
  }
}

// GET /api/pickups/my — get logged-in user's pickups
async function getMyPickups(req, res, next) {
  try {
    const { status, waste_type, search, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = 'SELECT * FROM pickups WHERE user_id = ?';
    const params = [req.user.id];

    if (status) { query += ' AND status = ?'; params.push(status); }
    if (waste_type) { query += ' AND waste_type = ?'; params.push(waste_type); }
    if (search) { query += ' AND (pickup_address LIKE ? OR instructions LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);

    const [pickups] = await pool.query(query, params);

    // Count total for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM pickups WHERE user_id = ?';
    const countParams = [req.user.id];
    if (status) { countQuery += ' AND status = ?'; countParams.push(status); }
    if (waste_type) { countQuery += ' AND waste_type = ?'; countParams.push(waste_type); }
    if (search) { countQuery += ' AND (pickup_address LIKE ? OR instructions LIKE ?)'; countParams.push(`%${search}%`, `%${search}%`); }

    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.json({ success: true, pickups, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
}

// GET /api/pickups/:id — get single pickup (must belong to user)
async function getPickupById(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM pickups WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pickup not found.' });
    }
    res.json({ success: true, pickup: rows[0] });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/pickups/:id/cancel — user cancels their own pending pickup
async function cancelPickup(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM pickups WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Pickup not found.' });
    }

    const pickup = rows[0];
    if (!CANCELLABLE_STATUSES.includes(pickup.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel a pickup with status "${pickup.status}".` });
    }

    await pool.query("UPDATE pickups SET status = 'cancelled' WHERE id = ?", [pickup.id]);
    res.json({ success: true, message: 'Pickup cancelled successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { createPickup, getMyPickups, getPickupById, cancelPickup };
