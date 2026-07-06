const { getBearerToken, verifyAuthToken } = require("../services/authTokenService");

function requireAuth(req, res, next) {
  const token = getBearerToken(req.headers.authorization || "");
  const payload = verifyAuthToken(token);

  if (!payload?.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  req.authUserId = Number(payload.userId);
  next();
}

function resolveAuthUserId(req) {
  if (req.authUserId) {
    return req.authUserId;
  }

  const token = getBearerToken(req.headers.authorization || "");
  const payload = verifyAuthToken(token);
  return payload?.userId ? Number(payload.userId) : null;
}

module.exports = {
  requireAuth,
  resolveAuthUserId,
};
