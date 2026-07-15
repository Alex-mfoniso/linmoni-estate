import NotificationListScreen from "../../components/NotificationListScreen";

export default function StaffNotificationsScreen() {
  return (
    <NotificationListScreen
      title="Notifications"
      subtitle="Operational alerts and booking updates."
      routePrefix="/(staff)"
    />
  );
}
