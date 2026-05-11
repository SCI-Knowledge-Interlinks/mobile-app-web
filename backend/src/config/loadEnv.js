const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

/**
 * Loads env for the backend from:
 * 1. Monorepo root `.env` (shared with other packages)
 * 2. `backend/.env` (optional overrides — wins on duplicate keys)
 *
 * `server.js` lives in `backend/src`, so backend root is one level up from `src`.
 */
function loadEnv() {
  const backendRoot = path.resolve(__dirname, "../..");
  const repoRoot = path.resolve(backendRoot, "..");

  const rootEnv = path.join(repoRoot, ".env");
  const backendEnv = path.join(backendRoot, ".env");

  if (fs.existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv });
  }
  if (fs.existsSync(backendEnv)) {
    dotenv.config({ path: backendEnv, override: true });
  }
}

module.exports = { loadEnv };
