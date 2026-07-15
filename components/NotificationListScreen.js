import { useEffect, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
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

export default function NotificationListScreen({
  title = "Notifications",
  subtitle = "Recent activity for your account.",
  routePrefix,
}) {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    async function start() {
      setLoading(true);
      setError("");

      try {
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
  }, [currentUser?.uid]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 300));
    } finally {
      setRefreshing(false);
    }
  }

  async function handleOpen(notification) {
    if (!notification?.relatedId || !routePrefix) {
      return;
    }

    try {
      await markNotificationAsRead(notification.id, currentUser?.uid);
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
      await deleteNotification(notification.id, currentUser?.uid);
    } catch (err) {
      Alert.alert("Notification", err?.message || "Unable to delete notification.");
    }
  }

  async function handleMarkRead(notification) {
    try {
      await markNotificationAsRead(notification.id, currentUser?.uid);
    } catch (err) {
      Alert.alert("Notification", err?.message || "Unable to mark as read.");
    }
  }

  async function handleMarkAllRead() {
    await markAllNotificationsAsRead(currentUser?.uid);
  }

  async function handleDeleteAllRead() {
    await deleteAllReadNotifications(currentUser?.uid);
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
});
