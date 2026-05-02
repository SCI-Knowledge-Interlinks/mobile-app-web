CREATE DATABASE IF NOT EXISTS `__DB_NAME__`;

USE `__DB_NAME__`;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  country_code VARCHAR(8) NOT NULL DEFAULT '+91',
  mobile VARCHAR(15),
  company VARCHAR(150),
  designation VARCHAR(150),
  gender VARCHAR(20),
  city VARCHAR(100),
  country VARCHAR(100),
  pincode VARCHAR(20),
  profile_image_url VARCHAR(500),
  password_hash TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  mobile_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS verification_codes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  channel ENUM('email', 'mobile') NOT NULL,
  target_value VARCHAR(255) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  otp_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  used_at DATETIME NULL,
  attempt_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_target_channel_purpose (target_value, channel, purpose),
  INDEX idx_user_channel_purpose (user_id, channel, purpose),
  INDEX idx_target_channel_purpose (target_value, channel, purpose),
  INDEX idx_expires_at (expires_at)
);
