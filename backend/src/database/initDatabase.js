const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
const { getDatabaseName } = require("../config/databaseName");

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const initDatabase = async () => {
  const schemaPath = path.resolve(__dirname, "schema.sql");
  const databaseName = getDatabaseName();
  const schema = fs
    .readFileSync(schemaPath, "utf8")
    .replaceAll("__DB_NAME__", databaseName);

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
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
