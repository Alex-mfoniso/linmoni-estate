import NotificationListScreen from "../../components/NotificationListScreen";

export default function RealtorNotificationsScreen() {
  return (
    <NotificationListScreen
      title="Notifications"
      subtitle="Recent updates for your listings and conversations."
      routePrefix="/(realtor)"
    />
  );
}
