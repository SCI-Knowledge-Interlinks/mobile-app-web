CREATE DATABASE IF NOT EXISTS `__DB_NAME__`;

USE `__DB_NAME__`;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
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
  badge_category VARCHAR(100),
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

CREATE TABLE IF NOT EXISTS events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  banner_image TEXT NULL,
  description TEXT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_social_links (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  event_id BIGINT NOT NULL,
  platform VARCHAR(100) NOT NULL,
  link TEXT NOT NULL,
  INDEX idx_event_social_links_event_id (event_id),
  CONSTRAINT fk_event_social_links_event_id
    FOREIGN KEY (event_id) REFERENCES events (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exhibitors (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  logo TEXT NULL,
  name VARCHAR(255) NOT NULL,
  booth_no VARCHAR(50) NULL,
  hall_no VARCHAR(50) NULL,
  title VARCHAR(255) NULL,
  details TEXT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  day VARCHAR(50) NULL,
  track VARCHAR(255) NULL,
  title VARCHAR(255) NOT NULL,
  time VARCHAR(100) NULL,
  date DATE NULL,
  place VARCHAR(255) NULL,
  about TEXT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS speakers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NULL,
  company VARCHAR(255) NULL,
  speaker_type VARCHAR(100) NULL,
  bio TEXT NULL,
  image TEXT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session_speakers (
  session_id BIGINT NOT NULL,
  speaker_id BIGINT NOT NULL,
  PRIMARY KEY (session_id, speaker_id),
  INDEX idx_session_speakers_speaker_id (speaker_id),
  CONSTRAINT fk_session_speakers_session_id
    FOREIGN KEY (session_id) REFERENCES sessions (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_session_speakers_speaker_id
    FOREIGN KEY (speaker_id) REFERENCES speakers (id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS awards (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  image TEXT NULL,
  details TEXT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  image TEXT NULL,
  title VARCHAR(255) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS b2b_partnering (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  image TEXT NULL,
  title VARCHAR(255) NULL,
  details TEXT NULL,
  login_url TEXT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS boci (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  image TEXT NULL,
  details TEXT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS partners (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  logo TEXT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NULL,
  business VARCHAR(255) NULL,
  title VARCHAR(255) NULL,
  details TEXT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS badge_registrations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reg_id VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(200) NOT NULL,
  company VARCHAR(300) NULL,
  designation VARCHAR(150) NULL,
  badge_category VARCHAR(100) NULL,
  user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_badge_user_id (user_id)
);

CREATE TABLE IF NOT EXISTS chat_conversations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  type ENUM('support', 'direct') NOT NULL DEFAULT 'direct',
  event_id BIGINT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_chat_conversations_type (type)
);

CREATE TABLE IF NOT EXISTS chat_participants (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  conversation_id BIGINT NOT NULL,
  user_id INT NOT NULL,
  last_read_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_chat_participant (conversation_id, user_id),
  INDEX idx_chat_participants_user (user_id)
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  conversation_id BIGINT NOT NULL,
  sender_user_id INT NULL,
  sender_name VARCHAR(150) NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_chat_messages_conversation (conversation_id, created_at)
);

CREATE TABLE IF NOT EXISTS user_device_tokens (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  fcm_token VARCHAR(512) NOT NULL,
  platform ENUM('android', 'ios', 'web') NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_fcm_token (fcm_token),
  INDEX idx_user_device_tokens_user_id (user_id),
  CONSTRAINT fk_user_device_tokens_user_id
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE
);
