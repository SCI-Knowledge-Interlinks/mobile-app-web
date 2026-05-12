const DEV_DATABASE_NAME = "prawaas_db_dev";
const PROD_DATABASE_NAME = "prawaas_db_prod";

const getDatabaseProfile = () =>
  (process.env.DB_PROFILE || process.env.NODE_ENV || "local").trim().toLowerCase();

const getProfiledEnv = (key) => {
  const profile = getDatabaseProfile() === "production" ? "PROD" : "LOCAL";
  return process.env[`DB_${profile}_${key}`] || process.env[`DB_${key}`];
};

const getDatabaseName = () => {
  const databaseName = getProfiledEnv("NAME");

  if (databaseName?.trim()) {
    return databaseName.trim();
  }

  return getDatabaseProfile() === "production"
    ? PROD_DATABASE_NAME
    : DEV_DATABASE_NAME;
};

const getDatabaseConfig = () => ({
  host: getProfiledEnv("HOST") || "localhost",
  port: Number(getProfiledEnv("PORT") || 3306),
  user: getProfiledEnv("USER") || "root",
  password: getProfiledEnv("PASSWORD") || "",
  database: getDatabaseName(),
});

module.exports = {
  DEV_DATABASE_NAME,
  PROD_DATABASE_NAME,
  getDatabaseConfig,
  getDatabaseName,
  getDatabaseProfile,
};
