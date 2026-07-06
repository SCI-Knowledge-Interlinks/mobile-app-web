/**
 * Prod API envelope on every JSON response:
 * { code: number, message: string, details?: object, ...payload }
 *
 * Success: code === 200
 * Failure: code !== 200 (or HTTP error)
 */

export function normalizeApiEnvelope(data = {}) {
  const details =
    data.details && typeof data.details === "object" && !Array.isArray(data.details)
      ? data.details
      : {};

  return {
    code: typeof data.code === "number" ? data.code : null,
    message: typeof data.message === "string" ? data.message : "",
    details,
  };
}

export function isApiSuccess(data, httpStatus = 200) {
  if (typeof data?.code === "number") {
    return data.code === 200;
  }

  if (data?.success === false) {
    return false;
  }

  return httpStatus >= 200 && httpStatus < 300;
}

export function getApiDisplayMessage(envelope) {
  const { message, details } = normalizeApiEnvelope(envelope);
  const reason = details?.reason;

  if (typeof reason === "string" && reason.trim()) {
    return reason.trim();
  }

  if (message.trim()) {
    return message.trim();
  }

  return "Something went wrong. Please try again.";
}

export function createApiError(envelope, httpStatus = 500) {
  const api = normalizeApiEnvelope(envelope);
  const error = new Error(getApiDisplayMessage(api));

  error.name = "ApiError";
  error.api = api;
  error.code = api.code ?? httpStatus;
  error.details = api.details;
  error.httpStatus = httpStatus;

  return error;
}

export function getApiErrorResponse(error) {
  if (error?.api) {
    return error.api;
  }

  if (error?.code != null || error?.details) {
    return normalizeApiEnvelope({
      code: typeof error.code === "number" ? error.code : null,
      message: error.message || "",
      details: error.details || {},
    });
  }

  return null;
}

export function getApiErrorMessage(error) {
  const api = getApiErrorResponse(error);
  if (api) {
    return getApiDisplayMessage(api);
  }

  return error?.message || "Something went wrong. Please try again.";
}

export function isApiError(error) {
  return error?.name === "ApiError" || Boolean(error?.api);
}
