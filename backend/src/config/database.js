const { loadEnv } = require("./loadEnv");
loadEnv();

const mysql = require("mysql2/promise");
const { getDatabaseConfig } = require("./databaseName");

const db = getDatabaseConfig();
const databaseName = db.database;
const dbHost = db.host.trim();
const dbUser = db.user.trim();
const dbPassword = String(db.password ?? "").trim();
const isLocalDatabaseHost = ["localhost", "127.0.0.1", "::1"].includes(dbHost);
const shouldAutoCreateDatabase =
  process.env.DB_AUTO_CREATE?.trim() === "true" ||
  (!process.env.DB_AUTO_CREATE && isLocalDatabaseHost);

/**
 * Main pool used by the app after the database exists.
 * mysql2 creates the pool immediately, but it only connects when we run a query.
 */
const pool = mysql.createPool({
  host: dbHost,
  port: db.port,
  user: dbUser,
  password: dbPassword,
  database: databaseName,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
  ...(db.ssl ? { ssl: db.ssl } : {}),
});

/**
 * Create the database and users table one time.
 * `IF NOT EXISTS` makes this safe to run every time the server starts.
 */
const initializeDatabase = async () => {
  const connection = await mysql.createConnection({
    host: dbHost,
    port: db.port,
    user: dbUser,
    password: dbPassword,
    ...(db.ssl ? { ssl: db.ssl } : {}),
  });

  try {
    if (shouldAutoCreateDatabase) {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    }

    await connection.query(`USE \`${databaseName}\``);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`first_name\` VARCHAR(100) NOT NULL,
        \`last_name\` VARCHAR(100) NULL,
        \`email\` VARCHAR(100) NOT NULL UNIQUE,
        \`country_code\` VARCHAR(8) NOT NULL DEFAULT '+91',
        \`mobile\` VARCHAR(15) NOT NULL,
        \`company\` VARCHAR(150),
        \`designation\` VARCHAR(150),
        \`gender\` VARCHAR(20),
        \`city\` VARCHAR(100),
        \`country\` VARCHAR(100),
        \`pincode\` VARCHAR(20),
        \`profile_image_url\` VARCHAR(500),
        \`badge_category\` VARCHAR(100) NULL,
        \`password_hash\` TEXT NOT NULL,
        \`email_verified\` BOOLEAN DEFAULT FALSE,
        \`mobile_verified\` BOOLEAN DEFAULT FALSE,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [userColumns] = await connection.query("SHOW COLUMNS FROM `users` LIKE 'country_code'");
    if (userColumns.length === 0) {
      await connection.query(`
        ALTER TABLE \`users\`
        ADD COLUMN \`country_code\` VARCHAR(8) NOT NULL DEFAULT '+91' AFTER \`email\`
      `);
    }

    const [profileImageColumns] = await connection.query(
      "SHOW COLUMNS FROM `users` LIKE 'profile_image_url'"
    );
    if (profileImageColumns.length === 0) {
      await connection.query(`
        ALTER TABLE \`users\`
        ADD COLUMN \`profile_image_url\` VARCHAR(500) NULL AFTER \`pincode\`
      `);
    }

    const [badgeCategoryColumns] = await connection.query(
      "SHOW COLUMNS FROM `users` LIKE 'badge_category'"
    );
    if (badgeCategoryColumns.length === 0) {
      await connection.query(`
        ALTER TABLE \`users\`
        ADD COLUMN \`badge_category\` VARCHAR(100) NULL AFTER \`profile_image_url\`
      `);
    }

    const [firstNameColumns] = await connection.query(
      "SHOW COLUMNS FROM `users` LIKE 'first_name'"
    );
    if (firstNameColumns.length === 0) {
      await connection.query(`
        ALTER TABLE \`users\`
        ADD COLUMN \`first_name\` VARCHAR(100) NULL AFTER \`id\`,
        ADD COLUMN \`last_name\` VARCHAR(100) NULL AFTER \`first_name\`
      `);
    }

    const [legacyNameColumns] = await connection.query(
      "SHOW COLUMNS FROM `users` LIKE 'name'"
    );
    if (legacyNameColumns.length > 0) {
      await connection.query(`
        UPDATE \`users\`
        SET
          \`first_name\` = CASE
            WHEN \`first_name\` IS NULL OR TRIM(\`first_name\`) = '' THEN
              SUBSTRING_INDEX(TRIM(COALESCE(\`name\`, '')), ' ', 1)
            ELSE \`first_name\`
          END,
          \`last_name\` = CASE
            WHEN \`last_name\` IS NULL OR TRIM(\`last_name\`) = '' THEN
              CASE
                WHEN LOCATE(' ', TRIM(COALESCE(\`name\`, ''))) > 0 THEN
                  TRIM(SUBSTRING(TRIM(\`name\`), LOCATE(' ', TRIM(\`name\`)) + 1))
                ELSE ''
              END
            ELSE \`last_name\`
          END
        WHERE \`name\` IS NOT NULL AND TRIM(\`name\`) <> ''
      `);

      await connection.query(`
        ALTER TABLE \`users\`
        DROP COLUMN \`name\`
      `);
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`verification_codes\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`user_id\` BIGINT NULL,
        \`channel\` ENUM('email', 'mobile') NOT NULL,
        \`target_value\` VARCHAR(255) NOT NULL,
        \`purpose\` VARCHAR(50) NOT NULL,
        \`otp_hash\` VARCHAR(255) NOT NULL,
        \`expires_at\` DATETIME NOT NULL,
        \`is_used\` BOOLEAN NOT NULL DEFAULT FALSE,
        \`used_at\` DATETIME NULL,
        \`attempt_count\` INT NOT NULL DEFAULT 0,
        \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`uniq_target_channel_purpose\` (\`target_value\`, \`channel\`, \`purpose\`),
        INDEX \`idx_user_channel_purpose\` (\`user_id\`, \`channel\`, \`purpose\`),
        INDEX \`idx_target_channel_purpose\` (\`target_value\`, \`channel\`, \`purpose\`),
        INDEX \`idx_expires_at\` (\`expires_at\`)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`events\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`title\` VARCHAR(255) NOT NULL,
        \`banner_image\` TEXT NULL,
        \`description\` TEXT NULL,
        \`start_date\` DATETIME NOT NULL,
        \`end_date\` DATETIME NOT NULL,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`event_social_links\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`event_id\` BIGINT NOT NULL,
        \`platform\` VARCHAR(100) NOT NULL,
        \`link\` TEXT NOT NULL,
        INDEX \`idx_event_social_links_event_id\` (\`event_id\`),
        CONSTRAINT \`fk_event_social_links_event_id\`
          FOREIGN KEY (\`event_id\`) REFERENCES \`events\` (\`id\`)
          ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`exhibitors\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`logo\` TEXT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`booth_no\` VARCHAR(50) NULL,
        \`hall_no\` VARCHAR(50) NULL,
        \`title\` VARCHAR(255) NULL,
        \`details\` TEXT NULL,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`sessions\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`day\` VARCHAR(50) NULL,
        \`track\` VARCHAR(255) NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`time\` VARCHAR(100) NULL,
        \`date\` DATE NULL,
        \`place\` VARCHAR(255) NULL,
        \`about\` TEXT NULL,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`speakers\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`name\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(255) NULL,
        \`company\` VARCHAR(255) NULL,
        \`speaker_type\` VARCHAR(100) NULL,
        \`bio\` TEXT NULL,
        \`image\` TEXT NULL,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`session_speakers\` (
        \`session_id\` BIGINT NOT NULL,
        \`speaker_id\` BIGINT NOT NULL,
        PRIMARY KEY (\`session_id\`, \`speaker_id\`),
        INDEX \`idx_session_speakers_speaker_id\` (\`speaker_id\`),
        CONSTRAINT \`fk_session_speakers_session_id\`
          FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\` (\`id\`)
          ON DELETE CASCADE,
        CONSTRAINT \`fk_session_speakers_speaker_id\`
          FOREIGN KEY (\`speaker_id\`) REFERENCES \`speakers\` (\`id\`)
          ON DELETE CASCADE
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`awards\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`image\` TEXT NULL,
        \`details\` TEXT NULL,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`gallery\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`image\` TEXT NULL,
        \`title\` VARCHAR(255) NULL,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`b2b_partnering\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`image\` TEXT NULL,
        \`title\` VARCHAR(255) NULL,
        \`details\` TEXT NULL,
        \`login_url\` TEXT NULL,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`boci\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`image\` TEXT NULL,
        \`details\` TEXT NULL,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`partners\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`logo\` TEXT NULL,
        \`name\` VARCHAR(255) NOT NULL,
        \`role\` VARCHAR(255) NULL,
        \`business\` VARCHAR(255) NULL,
        \`title\` VARCHAR(255) NULL,
        \`details\` TEXT NULL,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`badge_registrations\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`reg_id\` VARCHAR(50) NOT NULL UNIQUE,
        \`full_name\` VARCHAR(200) NOT NULL,
        \`company\` VARCHAR(300) NULL,
        \`designation\` VARCHAR(150) NULL,
        \`badge_category\` VARCHAR(100) NULL,
        \`user_id\` INT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_badge_user_id\` (\`user_id\`)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`chat_conversations\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`title\` VARCHAR(255) NOT NULL,
        \`type\` ENUM('support', 'direct') NOT NULL DEFAULT 'direct',
        \`event_id\` BIGINT NULL,
        \`metadata\` JSON NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_chat_conversations_type\` (\`type\`)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`chat_participants\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`conversation_id\` BIGINT NOT NULL,
        \`user_id\` INT NOT NULL,
        \`last_read_at\` DATETIME NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY \`uniq_chat_participant\` (\`conversation_id\`, \`user_id\`),
        INDEX \`idx_chat_participants_user\` (\`user_id\`)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`chat_messages\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`conversation_id\` BIGINT NOT NULL,
        \`sender_user_id\` INT NULL,
        \`sender_name\` VARCHAR(150) NULL,
        \`body\` TEXT NOT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX \`idx_chat_messages_conversation\` (\`conversation_id\`, \`created_at\`)
      )
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`user_device_tokens\` (
        \`id\` BIGINT PRIMARY KEY AUTO_INCREMENT,
        \`user_id\` INT NOT NULL,
        \`fcm_token\` VARCHAR(512) NOT NULL,
        \`platform\` ENUM('android', 'ios', 'web') NOT NULL,
        \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY \`uniq_fcm_token\` (\`fcm_token\`),
        INDEX \`idx_user_device_tokens_user_id\` (\`user_id\`),
        CONSTRAINT \`fk_user_device_tokens_user_id\`
          FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`)
          ON DELETE CASCADE
      )
    `);
  } finally {
    await connection.end();
  }
};

const testDatabaseConnection = async () => {
  const connection = await pool.getConnection();
  connection.release();
};

module.exports = {
  initializeDatabase,
  pool,
  testDatabaseConnection,
};
