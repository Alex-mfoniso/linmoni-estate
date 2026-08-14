import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "./AppHeader";
import LoadingSpinner from "./LoadingSpinner";
import NotificationList from "./NotificationList";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";
import ScreenContainer from "./ScreenContainer";
import { useAuth } from "../contexts/AuthContext";
import {
  deleteAllReadNotifications,
  deleteNotification,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToUserNotifications,
} from "../services/notificationService";
import { notificationApi } from "../services/notificationApi";

export default function NotificationListScreen({
  title = "Notifications",
  subtitle = "Recent activity for your account.",
  routePrefix,
  remote = false,
}) {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadRemote() {
    const result = await notificationApi.list({ page: 1, limit: 50 });
    setNotifications(result.items || []);
  }

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    async function start() {
      setLoading(true);
      setError("");

      try {
        if (remote) {
          await loadRemote();
          if (active) setLoading(false);
          return;
        }
        unsubscribe = await subscribeToUserNotifications(currentUser?.uid, (items) => {
          if (!active) {
            return;
          }

          setNotifications(Array.isArray(items) ? items : []);
          setLoading(false);
          setRefreshing(false);
        });
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load notifications.");
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void start();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [currentUser?.uid, remote]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      if (remote) await loadRemote();
      else await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      setRefreshing(false);
    }
  }

  async function handleOpen(notification) {
    if (!notification?.relatedId || !routePrefix) {
      return;
    }

    try {
      await (remote ? notificationApi.markRead(notification.id) : markNotificationAsRead(notification.id, currentUser?.uid));
      if (remote) setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
      const routeMap = {
        conversation: `${routePrefix}/messages/${notification.relatedId}`,
        booking: `${routePrefix}/bookings/${notification.relatedId}`,
        property: `${routePrefix}/properties/${notification.relatedId}`,
        user: `${routePrefix}/users/${notification.relatedId}`,
      };
      const nextRoute = routeMap[notification.relatedType] || null;
      if (nextRoute) {
        router.push(nextRoute);
      } else {
        Alert.alert("Notification", notification.message);
      }
    } catch (err) {
      Alert.alert("Notification", err?.message || "Unable to open this notification.");
    }
  }

  async function handleDelete(notification) {
    try {
      await (remote ? notificationApi.remove(notification.id) : deleteNotification(notification.id, currentUser?.uid));
      if (remote) setNotifications((items) => items.filter((item) => item.id !== notification.id));
    } catch (err) {
      Alert.alert("Notification", err?.message || "Unable to delete notification.");
    }
  }

  async function handleMarkRead(notification) {
    try {
      await (remote ? notificationApi.markRead(notification.id) : markNotificationAsRead(notification.id, currentUser?.uid));
      if (remote) setNotifications((items) => items.map((item) => item.id === notification.id ? { ...item, isRead: true } : item));
    } catch (err) {
      Alert.alert("Notification", err?.message || "Unable to mark as read.");
    }
  }

  async function handleMarkAllRead() {
    await (remote ? notificationApi.markAllRead() : markAllNotificationsAsRead(currentUser?.uid));
    if (remote) setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
  }

  async function handleDeleteAllRead() {
    if (remote) {
      const read = notifications.filter((item) => item.isRead);
      await Promise.all(read.map((item) => notificationApi.remove(item.id)));
      setNotifications((items) => items.filter((item) => !item.isRead));
    } else {
      await deleteAllReadNotifications(currentUser?.uid);
    }
  }

  return (
    <ScreenContainer scroll={false} contentContainerStyle={styles.container}>
      <AppHeader
        title={title}
        subtitle={subtitle}
        userName={currentUser?.displayName || userProfile?.fullName || "Member"}
        role={(userProfile?.role || "").toUpperCase()}
      />

      <View style={styles.actions}>
        <PrimaryButton title="Mark all read" onPress={handleMarkAllRead} />
        <SecondaryButton title="Clear read" onPress={handleDeleteAllRead} />
      </View>

      {loading ? <LoadingSpinner label="Loading notifications..." /> : null}

      {!loading && error ? <Text style={styles.error}>{error}</Text> : null}

      {!loading && !error ? (
        <NotificationList
          notifications={notifications}
          onOpen={handleOpen}
          onMarkRead={handleMarkRead}
          onDelete={handleDelete}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  error: { color: "#B9423E", fontSize: 13, fontWeight: "700" },
});
