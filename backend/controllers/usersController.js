// backend/controllers/usersController.js
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

// PATCH /api/users/profile — update profile info
async function updateProfile(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, phone, address } = req.body;
    const userId = req.user.id;

    await pool.query(
      'UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?',
      [name, phone || null, address || null, userId]
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({ success: true, message: 'Profile updated successfully.', user: rows[0] });
  } catch (err) {
    next(err);
  }
}

// PATCH /api/users/password — change password with current-password verification
async function changePassword(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { current_password, new_password } = req.body;
    const userId = req.user.id;

    const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const match = await bcrypt.compare(current_password, rows[0].password_hash);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    next(err);
  }
}

module.exports = { updateProfile, changePassword };
