-- EcoTrack Seed Data (Development Only)
-- IMPORTANT: Change all passwords before any real deployment!
-- Run AFTER schema.sql
USE ecotrack_db;

-- Demo users (passwords are bcrypt hashed)
-- Admin password: Admin@123
-- User password:  User@123
INSERT INTO users (name, email, phone, password_hash, address, role) VALUES
(
  'Admin User',
  'admin@ecotrack.dev',
  '9876543210',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '123 Admin Street, EcoCity',
  'admin'
),
(
  'Rahul Sharma',
  'rahul@demo.dev',
  '9123456789',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '45 Green Lane, Mumbai, MH 400001',
  'user'
),
(
  'Priya Patel',
  'priya@demo.dev',
  '9234567890',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '12 Eco Street, Pune, MH 411001',
  'user'
);

-- NOTE: The bcrypt hash above corresponds to password "password" for quick demo.
-- For production, always use properly hashed passwords via the registration API.
-- Actual demo credentials:
--   Admin: admin@ecotrack.dev / Admin@123  (use register API or update hash)
--   User:  rahul@demo.dev    / User@123   (use register API or update hash)

-- Sample pickups for Rahul (user id=2)
INSERT INTO pickups (user_id, waste_type, quantity_kg, pickup_address, pickup_date, pickup_time, instructions, status) VALUES
(2, 'dry_waste',   5.00,  '45 Green Lane, Mumbai', DATE_ADD(CURDATE(), INTERVAL 2 DAY),  '10:00:00', 'Please bring bags',       'pending'),
(2, 'plastic',     3.50,  '45 Green Lane, Mumbai', DATE_ADD(CURDATE(), INTERVAL -5 DAY), '09:00:00', NULL,                      'collected'),
(2, 'wet_waste',   8.20,  '45 Green Lane, Mumbai', DATE_ADD(CURDATE(), INTERVAL -10 DAY),'11:00:00', 'Heavy bags',              'collected'),
(2, 'e_waste',     1.00,  '45 Green Lane, Mumbai', DATE_ADD(CURDATE(), INTERVAL -15 DAY),'14:00:00', 'Old phone and charger',   'approved'),
(2, 'dry_waste',   4.00,  '45 Green Lane, Mumbai', DATE_ADD(CURDATE(), INTERVAL 5 DAY),  '10:00:00', NULL,                      'pending');

-- Sample pickups for Priya (user id=3)
INSERT INTO pickups (user_id, waste_type, quantity_kg, pickup_address, pickup_date, pickup_time, instructions, status) VALUES
(3, 'wet_waste',   6.00,  '12 Eco Street, Pune',   DATE_ADD(CURDATE(), INTERVAL 1 DAY),  '08:00:00', NULL,                      'approved'),
(3, 'plastic',     2.50,  '12 Eco Street, Pune',   DATE_ADD(CURDATE(), INTERVAL -3 DAY), '13:00:00', 'Sorted by colour',        'collected');

-- Rewards for Rahul (plastic pickup id=2, wet_waste pickup id=3)
INSERT INTO rewards (user_id, points, description, pickup_id) VALUES
(2, 35, 'Points for collecting 3.5 kg of plastic (10 pts/kg)', 2),
(2, 82, 'Points for collecting 8.2 kg of wet waste (10 pts/kg)', 3);

-- Rewards for Priya (collected pickup id=7)
INSERT INTO rewards (user_id, points, description, pickup_id) VALUES
(3, 25, 'Points for collecting 2.5 kg of plastic (10 pts/kg)', 7);
