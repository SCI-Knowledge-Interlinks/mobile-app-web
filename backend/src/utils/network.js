const dns = require("dns").promises;

const NO_INTERNET_ERROR_CODE = "NO_INTERNET";

const createNoInternetError = () => {
  const error = new Error("No internet connection. Please check your connection and try again.");
  error.code = NO_INTERNET_ERROR_CODE;
  return error;
};

const isNetworkFailure = (error) => {
  const message = String(error?.message || "").toLowerCase();
  return (
    error?.code === "ENOTFOUND" ||
    error?.code === "EAI_AGAIN" ||
    error?.code === "ECONNREFUSED" ||
    error?.code === "ECONNRESET" ||
    error?.code === "ETIMEDOUT" ||
    message.includes("fetch failed") ||
    message.includes("network")
  );
};

const hasInternetConnection = async () => {
  try {
    await dns.lookup("example.com");
    return true;
  } catch {
    return false;
  }
};

const fetchWithInternetCheck = async (url, options) => {
  const isConnected = await hasInternetConnection();

  if (!isConnected) {
    throw createNoInternetError();
  }

  try {
    return await fetch(url, options);
  } catch (error) {
    if (isNetworkFailure(error)) {
      throw createNoInternetError();
    }

    throw error;
  }
};

module.exports = {
  NO_INTERNET_ERROR_CODE,
  fetchWithInternetCheck,
};
