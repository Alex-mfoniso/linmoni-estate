import NotificationListScreen from "../../components/NotificationListScreen";

export default function AdminNotificationsScreen() {
  return (
    <NotificationListScreen
      title="Notifications"
      subtitle="Platform activity and moderation updates."
      routePrefix="/(admin)"
    />
  );
}
