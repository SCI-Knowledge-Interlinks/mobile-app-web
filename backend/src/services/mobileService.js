const { fetchWithInternetCheck } = require("../utils/network");

const sendInteraktTemplateMessage = async ({
  countryCode,
  phoneNumber,
  callbackData,
  templateName,
  bodyValues = [],
  buttonValues,
}) => {
  const apiKey = process.env.INTERAKT_API_KEY?.trim();
  const apiUrl =
    process.env.INTERAKT_API_URL?.trim() ||
    "https://api.interakt.ai/v1/public/message/";

  if (!apiKey) {
    throw new Error("Missing INTERAKT_API_KEY in .env");
  }

  const payload = {
    countryCode,
    phoneNumber,
    callbackData,
    type: "Template",
    template: {
      name: templateName,
      languageCode: process.env.INTERAKT_TEMPLATE_LANGUAGE || "en",
      bodyValues,
      ...(buttonValues ? { buttonValues } : {}),
    },
  };

  const response = await fetchWithInternetCheck(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    console.error("Interakt API error:", data);
    throw new Error(data.message || data.error || "Interakt API request failed");
  }

  return data;
};

module.exports = {
  sendInteraktTemplateMessage,
};
