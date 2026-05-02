const jwt = require("jsonwebtoken");

const TOKEN_EXPIRES_IN = process.env.AUTH_TOKEN_EXPIRES_IN || "30d";

const getTokenSecret = () => {
  return process.env.AUTH_TOKEN_SECRET || "local-development-auth-secret";
};

const createAuthToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    getTokenSecret(),
    {
      expiresIn: TOKEN_EXPIRES_IN,
    }
  );
};

const verifyAuthToken = (token = "") => {
  try {
    return jwt.verify(token, getTokenSecret());
  } catch {
    return null;
  }
};

const getBearerToken = (authorization = "") => {
  const match = String(authorization).match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
};

module.exports = {
  createAuthToken,
  getBearerToken,
  verifyAuthToken,
};
