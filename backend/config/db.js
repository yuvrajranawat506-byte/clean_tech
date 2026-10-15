// backend/config/db.js
// Dual-mode database layer: connects to MySQL if available,
// with automatic zero-configuration fallback to persistent SQLite (Node 24 built-in)
// so the application runs immediately without requiring manual MySQL setup.

require('dotenv').config();
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

let activeEngine = 'mysql'; // 'mysql' | 'sqlite'
let mysqlPool = null;
let sqlitePool = null;

// Initialize MySQL pool
try {
  mysqlPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ecotrack_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 2000,
  });
} catch (e) {
  mysqlPool = null;
}

function initSqlitePool() {
  const { DatabaseSync } = require('node:sqlite');
  const dbFile = path.join(__dirname, '..', 'ecotrack.db');
  const db = new DatabaseSync(dbFile);

  // Enable WAL mode for better concurrency
  try { db.exec('PRAGMA journal_mode = WAL;'); } catch (_) {}

  // Register MySQL-compatible scalar functions in SQLite
  db.function('DATE_FORMAT', (val, fmt) => {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    if (fmt === '%Y-%m') return d.toISOString().slice(0, 7);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  });

  db.function('CURDATE', () => new Date().toISOString().slice(0, 10));

  // Initialize tables matching schema.sql
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      password_hash TEXT NOT NULL,
      address TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS pickups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      waste_type TEXT NOT NULL,
      quantity_kg REAL NOT NULL,
      pickup_address TEXT NOT NULL,
      pickup_date TEXT NOT NULL,
      pickup_time TEXT NOT NULL,
      instructions TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      points INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL,
      pickup_id INTEGER UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (pickup_id) REFERENCES pickups(id) ON DELETE SET NULL
    );
  `);

  // Seed demo accounts if empty
  const countRow = db.prepare('SELECT COUNT(*) as c FROM users').get();
  if (countRow.c === 0) {
    console.log('🌱 Seeding demo accounts and mock pickups into SQLite database...');
    // Password hash for 'password'
    const pwdHash = '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
    db.prepare(`
      INSERT INTO users (id, name, email, phone, password_hash, address, role) VALUES
      (1, 'Admin User', 'admin@ecotrack.dev', '9876543210', ?, '123 Admin Street, EcoCity', 'admin'),
      (2, 'Rahul Sharma', 'rahul@demo.dev', '9123456789', ?, '45 Green Lane, Mumbai, MH 400001', 'user'),
      (3, 'Priya Patel', 'priya@demo.dev', '9234567890', ?, '12 Eco Street, Pune, MH 411001', 'user')
    `).run(pwdHash, pwdHash, pwdHash);

    db.prepare(`
      INSERT INTO pickups (id, user_id, waste_type, quantity_kg, pickup_address, pickup_date, pickup_time, instructions, status) VALUES
      (1, 2, 'dry_waste', 5.00, '45 Green Lane, Mumbai', date('now', '+2 days'), '10:00:00', 'Please bring bags', 'pending'),
      (2, 2, 'plastic', 3.50, '45 Green Lane, Mumbai', date('now', '-5 days'), '09:00:00', NULL, 'collected'),
      (3, 2, 'wet_waste', 8.20, '45 Green Lane, Mumbai', date('now', '-10 days'), '11:00:00', 'Heavy bags', 'collected'),
      (4, 2, 'e_waste', 1.00, '45 Green Lane, Mumbai', date('now', '-15 days'), '14:00:00', 'Old phone and charger', 'approved'),
      (5, 2, 'dry_waste', 4.00, '45 Green Lane, Mumbai', date('now', '+5 days'), '10:00:00', NULL, 'pending'),
      (6, 3, 'wet_waste', 6.00, '12 Eco Street, Pune', date('now', '+1 days'), '08:00:00', NULL, 'approved'),
      (7, 3, 'plastic', 2.50, '12 Eco Street, Pune', date('now', '-3 days'), '13:00:00', 'Sorted by colour', 'collected')
    `).run();

    db.prepare(`
      INSERT INTO rewards (id, user_id, points, description, pickup_id) VALUES
      (1, 2, 35, 'Points for collecting 3.5 kg of plastic (10 pts/kg)', 2),
      (2, 2, 82, 'Points for collecting 8.2 kg of wet waste (10 pts/kg)', 3),
      (3, 3, 25, 'Points for collecting 2.5 kg of plastic (10 pts/kg)', 7)
    `).run();
  }

  function adaptSql(sql) {
    let s = sql;
    s = s.replace(/\s+FOR\s+UPDATE/gi, '');
    s = s.replace(/DATE_SUB\s*\(\s*CURDATE\(\)\s*,\s*INTERVAL\s*6\s*MONTH\s*\)/gi, "date('now', '-6 month')");
    return s;
  }

  return {
    async query(sql, params = []) {
      const adapted = adaptSql(sql);
      const isSelect = /^\s*SELECT/i.test(adapted);
      try {
        const stmt = db.prepare(adapted);
        if (isSelect) {
          const rows = stmt.all(...params);
          return [rows, []];
        } else {
          const info = stmt.run(...params);
          return [{ insertId: Number(info.lastInsertRowid), affectedRows: info.changes }, []];
        }
      } catch (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
          err.code = 'ER_DUP_ENTRY';
        }
        throw err;
      }
    },
    async getConnection() {
      return {
        query: (sql, params) => this.query(sql, params),
        beginTransaction: async () => { db.exec('BEGIN TRANSACTION;'); },
        commit: async () => { db.exec('COMMIT;'); },
        rollback: async () => { db.exec('ROLLBACK;'); },
        release: () => {},
      };
    },
    async end() {
      try { db.close(); } catch (_) {}
    }
  };
}

async function testConnection() {
  if (mysqlPool) {
    try {
      const conn = await Promise.race([
        mysqlPool.getConnection(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 1500))
      ]);
      console.log('✅ MySQL database connected successfully');
      conn.release();
      activeEngine = 'mysql';
      return;
    } catch (err) {
      console.log(`ℹ️  MySQL server not reached (${err.message}).`);
      mysqlPool = null;
    }
  }

  // Fallback to SQLite
  console.log('🔄 Activating persistent SQLite engine (ecotrack.db)...');
  sqlitePool = initSqlitePool();
  activeEngine = 'sqlite';
  console.log('✅ Database initialized successfully via SQLite fallback mode.');
  console.log('🌿 Demo credentials ready: admin@ecotrack.dev / rahul@demo.dev (password: "password")');
}

// Proxy pool that delegates to the active engine
const pool = {
  async query(sql, params) {
    if (activeEngine === 'sqlite') {
      if (!sqlitePool) sqlitePool = initSqlitePool();
      return sqlitePool.query(sql, params);
    }
    return mysqlPool.query(sql, params);
  },
  async execute(sql, params) {
    return this.query(sql, params);
  },
  async getConnection() {
    if (activeEngine === 'sqlite') {
      if (!sqlitePool) sqlitePool = initSqlitePool();
      return sqlitePool.getConnection();
    }
    return mysqlPool.getConnection();
  },
  async end() {
    if (activeEngine === 'sqlite' && sqlitePool) {
      return sqlitePool.end();
    }
    if (mysqlPool) return mysqlPool.end();
  }
};

module.exports = { pool, testConnection };
