// backend/controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

// Helper: generate JWT token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, password, address } = req.body;

    // Check if email already registered
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert new user — role is always 'user' (admin cannot be self-assigned)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash, address, role) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, password_hash, address || null, 'user']
    );

    const newUser = { id: result.insertId, email, role: 'user' };
    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: { id: newUser.id, name, email, role: 'user' },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const [rows] = await pool.query(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout (stateless JWT — client deletes token)
function logout(req, res) {
  res.json({ success: true, message: 'Logged out successfully.' });
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, address, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, logout, getMe };
