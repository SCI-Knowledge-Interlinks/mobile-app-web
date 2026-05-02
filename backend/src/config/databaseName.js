const DEV_DATABASE_NAME = "prawaas_db_dev";
const PROD_DATABASE_NAME = "prawaas_db_prod";

const getDatabaseName = () => {
  if (process.env.DB_NAME?.trim()) {
    return process.env.DB_NAME.trim();
  }

  return process.env.NODE_ENV === "production"
    ? PROD_DATABASE_NAME
    : DEV_DATABASE_NAME;
};

module.exports = {
  DEV_DATABASE_NAME,
  PROD_DATABASE_NAME,
  getDatabaseName,
};
