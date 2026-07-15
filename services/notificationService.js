import storage from "../utils/storage";

const STORAGE_KEY = "linpal.notifications.v1";

const subscribers = new Set();
const unreadSubscribers = new Set();

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function buildId() {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeNotification(notification) {
  return {
    id: String(notification?.id || buildId()),
    userId: String(notification?.userId || "").trim(),
    title: String(notification?.title || "").trim(),
    message: String(notification?.message || "").trim(),
    type: String(notification?.type || "general").trim(),
    relatedId: String(notification?.relatedId || "").trim(),
    relatedType: String(notification?.relatedType || "").trim(),
    isRead: Boolean(notification?.isRead),
    deduplicationKey: String(notification?.deduplicationKey || "").trim(),
    createdAt: notification?.createdAt || new Date().toISOString(),
    updatedAt: notification?.updatedAt || new Date().toISOString(),
  };
}

async function readNotifications() {
  const raw = await storage.getItem(STORAGE_KEY);
  const parsed = raw ? safeParse(raw) : [];

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed.map(normalizeNotification);
}

async function writeNotifications(notifications) {
  await storage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

function sortLatest(left, right) {
  return new Date(right.createdAt) - new Date(left.createdAt);
}

async function emit() {
  const notifications = await readNotifications();
  const byUser = new Map();

  notifications.forEach((notification) => {
    if (!byUser.has(notification.userId)) {
      byUser.set(notification.userId, []);
    }

    byUser.get(notification.userId).push(notification);
  });

  await Promise.all(
    [...subscribers].map(async (subscriber) => {
      const items = (byUser.get(subscriber.userId) || []).sort(sortLatest);
      await subscriber.callback(items);
    })
  );

  await Promise.all(
    [...unreadSubscribers].map(async (subscriber) => {
      const items = byUser.get(subscriber.userId) || [];
      const count = items.reduce((total, item) => total + (item.isRead ? 0 : 1), 0);
      await subscriber.callback(count);
    })
  );
}

export async function createNotification(notificationData) {
  const notification = normalizeNotification(notificationData);

  if (!notification.userId) {
    throw new Error("Missing notification recipient.");
  }

  const notifications = await readNotifications();
  const existing = notification.deduplicationKey
    ? notifications.find(
        (item) =>
          item.userId === notification.userId &&
          item.deduplicationKey === notification.deduplicationKey
      )
    : null;

  if (existing) {
    const nextNotification = normalizeNotification({
      ...existing,
      ...notificationData,
      id: existing.id,
      updatedAt: new Date().toISOString(),
    });

    const nextNotifications = notifications.map((item) =>
      item.id === existing.id ? nextNotification : item
    );
    await writeNotifications(nextNotifications);
    await emit();
    return nextNotification;
  }

  const nextNotifications = [notification, ...notifications];
  await writeNotifications(nextNotifications);
  await emit();
  return notification;
}

export async function subscribeToUserNotifications(userId, callback) {
  if (!userId || typeof callback !== "function") {
    return () => {};
  }

  const subscriber = { userId, callback };
  subscribers.add(subscriber);

  try {
    const notifications = await readNotifications();
    await callback(
      notifications.filter((notification) => notification.userId === userId).sort(sortLatest)
    );
  } catch {
    await callback([]);
  }

  return () => {
    subscribers.delete(subscriber);
  };
}

export async function subscribeToUnreadCount(userId, callback) {
  if (!userId || typeof callback !== "function") {
    return () => {};
  }

  const subscriber = { userId, callback };
  unreadSubscribers.add(subscriber);

  try {
    const notifications = await readNotifications();
    const count = notifications.reduce((total, notification) => {
      if (notification.userId !== userId || notification.isRead) {
        return total;
      }

      return total + 1;
    }, 0);
    await callback(count);
  } catch {
    await callback(0);
  }

  return () => {
    unreadSubscribers.delete(subscriber);
  };
}

export async function markNotificationAsRead(notificationId, userId) {
  if (!notificationId || !userId) {
    return null;
  }

  const notifications = await readNotifications();
  const index = notifications.findIndex(
    (notification) => notification.id === notificationId && notification.userId === userId
  );

  if (index < 0) {
    return null;
  }

  const nextNotification = normalizeNotification({
    ...notifications[index],
    isRead: true,
    updatedAt: new Date().toISOString(),
  });

  const nextNotifications = [...notifications];
  nextNotifications[index] = nextNotification;
  await writeNotifications(nextNotifications);
  await emit();
  return nextNotification;
}

export async function markAllNotificationsAsRead(userId) {
  if (!userId) {
    return [];
  }

  const notifications = await readNotifications();
  const nextNotifications = notifications.map((notification) => {
    if (notification.userId !== userId || notification.isRead) {
      return notification;
    }

    return normalizeNotification({
      ...notification,
      isRead: true,
      updatedAt: new Date().toISOString(),
    });
  });

  await writeNotifications(nextNotifications);
  await emit();
  return nextNotifications.filter((notification) => notification.userId === userId);
}

export async function deleteNotification(notificationId, userId) {
  if (!notificationId || !userId) {
    return false;
  }

  const notifications = await readNotifications();
  const nextNotifications = notifications.filter(
    (notification) => !(notification.id === notificationId && notification.userId === userId)
  );

  await writeNotifications(nextNotifications);
  await emit();
  return true;
}

export async function deleteAllReadNotifications(userId) {
  if (!userId) {
    return [];
  }

  const notifications = await readNotifications();
  const nextNotifications = notifications.filter(
    (notification) => notification.userId !== userId || !notification.isRead
  );

  await writeNotifications(nextNotifications);
  await emit();
  return nextNotifications.filter((notification) => notification.userId === userId);
}

export async function getUnreadNotificationCount(userId) {
  if (!userId) {
    return 0;
  }

  const notifications = await readNotifications();
  return notifications.reduce((total, notification) => {
    if (notification.userId !== userId || notification.isRead) {
      return total;
    }

    return total + 1;
  }, 0);
}
