const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { getDatabaseName } = require("../config/databaseName");
const { loadEnv } = require("../config/loadEnv");

loadEnv();

const initDatabase = async () => {
  const schemaPath = path.resolve(__dirname, "schema.sql");
  const databaseName = getDatabaseName();
  const schema = fs
    .readFileSync(schemaPath, "utf8")
    .replaceAll("__DB_NAME__", databaseName);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "191.101.13.224",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "u773541120_prawaas_app",
    password: process.env.DB_PASSWORD || "v/xxVIL5",
    database: process.env.DB_NAME || "u773541120_prawaas_app",

    multipleStatements: true,
  });

  try {
    await connection.query(schema);
    console.log("Database initialized successfully");
  } finally {
    await connection.end();
  }
};

initDatabase().catch((error) => {
  console.error(
    "Database initialization failed:",
    error.code || error.sqlMessage || error.message || error
  );
  process.exit(1);
});
