const { getDefaultConfig } = require("expo/metro-config");
const { createProxyMiddleware } = require("http-proxy-middleware");

const config = getDefaultConfig(__dirname);

const proxyTarget = String(process.env.EXPO_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");

const API_PATH_PREFIXES = [
  "/auth",
  "/events",
  "/badges",
  "/chat",
  "/exhibitions",
  "/whatsapp",
  "/uploads",
];

function shouldProxyRequest(url = "") {
  const pathname = String(url).split("?")[0];
  return API_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

if (proxyTarget && !/^https?:\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/i.test(proxyTarget)) {
  const apiProxy = createProxyMiddleware({
    target: proxyTarget,
    changeOrigin: true,
    secure: true,
  });

  config.server = {
    ...config.server,
    enhanceMiddleware: (metroMiddleware) => (req, res, next) => {
      if (shouldProxyRequest(req.url)) {
        return apiProxy(req, res, next);
      }

      return metroMiddleware(req, res, next);
    },
  };
}

module.exports = config;
