-- EcoTrack Smart Waste Management Platform
-- Database Schema
-- Run this file first before seed.sql

CREATE DATABASE IF NOT EXISTS ecotrack_db;
USE ecotrack_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  address TEXT,
  role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Pickups table
CREATE TABLE IF NOT EXISTS pickups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  waste_type ENUM('wet_waste', 'dry_waste', 'plastic', 'e_waste') NOT NULL,
  quantity_kg DECIMAL(10, 2) NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_time TIME NOT NULL,
  instructions TEXT,
  status ENUM('pending', 'approved', 'collected', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_pickup_date (pickup_date),
  INDEX idx_waste_type (waste_type)
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  points INT NOT NULL DEFAULT 0,
  description VARCHAR(255) NOT NULL,
  pickup_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (pickup_id) REFERENCES pickups(id) ON DELETE SET NULL,
  -- Prevent duplicate reward credits for the same pickup
  UNIQUE KEY unique_pickup_reward (pickup_id),
  INDEX idx_user_id (user_id),
  INDEX idx_pickup_id (pickup_id)
);
