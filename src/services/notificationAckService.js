import { acknowledgeNotification } from "./authService";
import { addNotificationToInbox } from "./notificationInboxService";
import { getApiErrorMessage } from "../utils/network";

const ackedKeys = new Set();

function buildAckKey(deliveryId, event) {
  return `${deliveryId}:${event}`;
}

export function extractDeliveryId(payload) {
  const data = payload?.data || payload?.notification?.data || {};

  const raw =
    data.deliveryId ??
    data.delivery_id ??
    payload?.deliveryId ??
    payload?.delivery_id;

  if (raw == null || raw === "") {
    return null;
  }

  const deliveryId = Number(raw);
  return Number.isInteger(deliveryId) && deliveryId > 0 ? deliveryId : null;
}

export async function reportNotificationAck({ deliveryId, event }) {
  if (!deliveryId || !event) {
    return;
  }

  const key = buildAckKey(deliveryId, event);
  if (ackedKeys.has(key)) {
    return;
  }

  ackedKeys.add(key);

  try {
    await acknowledgeNotification({ deliveryId, event });
    console.log(`[FCM] notification-ack ${event} deliveryId=${deliveryId}`);
  } catch (error) {
    ackedKeys.delete(key);
    console.log("[FCM] notification-ack failed:", getApiErrorMessage(error));
  }
}

export async function ackNotificationDelivered(payload) {
  const deliveryId = extractDeliveryId(payload);
  if (!deliveryId) {
    return;
  }

  await reportNotificationAck({ deliveryId, event: "delivered" });
}

export async function ackNotificationRead(payloadOrDeliveryId) {
  const deliveryId =
    typeof payloadOrDeliveryId === "number"
      ? payloadOrDeliveryId
      : extractDeliveryId(payloadOrDeliveryId);

  if (!deliveryId) {
    return;
  }

  await reportNotificationAck({ deliveryId, event: "read" });
}

function handleServiceWorkerAckMessage(event) {
  const message = event?.data;
  if (!message?.type) {
    return;
  }

  if (message.type === "NOTIFICATION_RECEIVED") {
    addNotificationToInbox({
      title: message.title,
      body: message.body,
      deliveryId: message.deliveryId,
      data: message.data || {},
    });

    const deliveryId = Number(message.deliveryId);
    if (Number.isInteger(deliveryId) && deliveryId > 0) {
      reportNotificationAck({ deliveryId, event: "delivered" });
    }
    return;
  }

  if (message.type !== "NOTIFICATION_ACK") {
    return;
  }

  const deliveryId = Number(message.deliveryId);
  if (!Number.isInteger(deliveryId) || deliveryId <= 0) {
    return;
  }

  if (message.event === "read") {
    ackNotificationRead(deliveryId);
    return;
  }

  if (message.event === "delivered") {
    reportNotificationAck({ deliveryId, event: "delivered" });
  }
}

export function subscribeToServiceWorkerAckMessages() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return () => {};
  }

  navigator.serviceWorker.addEventListener("message", handleServiceWorkerAckMessage);

  return () => {
    navigator.serviceWorker.removeEventListener("message", handleServiceWorkerAckMessage);
  };
}
