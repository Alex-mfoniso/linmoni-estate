import NotificationListScreen from "../../components/NotificationListScreen";

export default function ClientNotificationsScreen() {
  return (
    <NotificationListScreen
      title="Notifications"
      subtitle="Recent updates for your client account."
      routePrefix="/(client)"
      remote
    />
  );
}
