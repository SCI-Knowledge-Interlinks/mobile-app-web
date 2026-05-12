const mysql = require("mysql2/promise");
const { getDatabaseConfig } = require("./databaseName");

const databaseConfig = getDatabaseConfig();
const databaseName = databaseConfig.database;
const dbHost = databaseConfig.host;
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
  port: databaseConfig.port,
  user: databaseConfig.user,
  password: databaseConfig.password,
  database: databaseName,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),
  queueLimit: 0,
});

/**
 * Create the database and users table one time.
 * `IF NOT EXISTS` makes this safe to run every time the server starts.
 */
const initializeDatabase = async () => {
  const connection = await mysql.createConnection({
    host: dbHost,
    port: databaseConfig.port,
    user: databaseConfig.user,
    password: databaseConfig.password,
  });

  try {
    if (shouldAutoCreateDatabase) {
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
    }

    await connection.query(`USE \`${databaseName}\``);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS \`users\` (
        \`id\` INT AUTO_INCREMENT PRIMARY KEY,
        \`name\` VARCHAR(100) NOT NULL,
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
