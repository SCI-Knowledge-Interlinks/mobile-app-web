/**
 * Sends email using Elastic Email API
 *
 * IMPORTANT:
 * Keep API key only in backend .env
 */
const { fetchWithInternetCheck } = require("../utils/network");

const sendOtpEmail = async ({ toEmail, otp }) => {
  const apiKey = process.env.ELASTIC_EMAIL_API_KEY?.trim();
  const fromEmail = process.env.FROM_EMAIL?.trim();
  const appName = process.env.APP_NAME || "Prawaas";

  if (!apiKey) {
    throw new Error("Missing ELASTIC_EMAIL_API_KEY in .env");
  }

  if (!fromEmail) {
    throw new Error("Missing FROM_EMAIL in .env");
  }

  const payload = {
    Recipients: [ {
      Email: `<${toEmail}>`,
    }],
    Content: {
      From: `${appName} <${fromEmail}>`,
      Subject: "Verify your email address",
      Body: [
        {
          ContentType: "HTML",
          Charset: "utf-8",
          Content: `
            <div style="font-family: Arial, sans-serif; padding: 16px;">
              <h2>Your verification code - OTP for Prawaas is ${otp}</h2>
              <p>This OTP is valid for 5 minutes.</p>
              <p>If you did not request this, you can ignore this email.</p>
            </div>
          `,
        },
        {
          ContentType: "PlainText",
          Charset: "utf-8",
          Content: `Your verification code - OTP for Prawaas is ${otp}. It is valid for 5 minutes.`,
        },
      ],
    },
  };

  /**
   * Prevent the backend request from waiting forever if the email provider
   * is slow or unreachable.
   */
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {
    const response = await fetchWithInternetCheck(
      "https://api.elasticemail.com/v4/emails",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-ElasticEmail-ApiKey": apiKey,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      }
    );

    const text = await response.text();

    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      console.error("Elastic Email error:", data);
      throw new Error("EMAIL_PROVIDER_FAILED");
    }

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      console.error("Elastic Email timeout:", error);
      throw new Error("EMAIL_PROVIDER_FAILED");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

module.exports = {
  sendOtpEmail,
};
