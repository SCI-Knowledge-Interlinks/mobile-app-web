const DEV_DATABASE_NAME = "prawaas_db_dev";
const PROD_DATABASE_NAME = "prawaas_db_prod";

const getDatabaseProfile = () =>
  (process.env.DB_PROFILE || process.env.NODE_ENV || "local").trim().toLowerCase();

const getProfiledEnv = (key) => {
  const profile = getDatabaseProfile() === "production" ? "PROD" : "LOCAL";
  return process.env[`DB_${profile}_${key}`] || process.env[`DB_${key}`];
};

const trimStr = (value, fallback = "") => {
  const s = value != null ? String(value).trim() : "";
  return s || fallback;
};

/** mysql2 `ssl` option; set DB_*_SSL=true or DB_*_SSL=insecure (see .env.example). */
const getSslOptionFromEnv = (raw) => {
  const v = trimStr(raw).toLowerCase();
  if (v === "true" || v === "1") return {};
  if (v === "insecure") return { rejectUnauthorized: false };
  return undefined;
};

const getDatabaseName = () => {
  const databaseName = trimStr(getProfiledEnv("NAME"), "");

  if (databaseName) {
    return databaseName;
  }

  return getDatabaseProfile() === "production"
    ? PROD_DATABASE_NAME
    : DEV_DATABASE_NAME;
};

const getDatabaseConfig = () => {
  const portRaw = getProfiledEnv("PORT");
  const port = Number(portRaw) || 3306;

  return {
    host: trimStr(getProfiledEnv("HOST"), "localhost"),
    port,
    user: trimStr(getProfiledEnv("USER"), "root"),
    password: trimStr(getProfiledEnv("PASSWORD"), ""),
    database: getDatabaseName(),
    ssl: getSslOptionFromEnv(getProfiledEnv("SSL")),
  };
};

module.exports = {
  DEV_DATABASE_NAME,
  PROD_DATABASE_NAME,
  getDatabaseConfig,
  getDatabaseName,
  getDatabaseProfile,
};