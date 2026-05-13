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
    host: process.env.DB_LOCAL_HOST || process.env.DB_PROD_HOST,
    port: Number(process.env.DB_LOCAL_PORT || process.env.DB_PROD_PORT),
    user: process.env.DB_LOCAL_USER || process.env.DB_PROD_USER,
    password: process.env.DB_LOCAL_PASSWORD || process.env.DB_PROD_PASSWORD,
    database: process.env.DB_LOCAL_NAME || process.env.DB_PROD_NAME,

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
