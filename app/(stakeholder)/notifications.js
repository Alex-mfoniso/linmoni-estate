import NotificationListScreen from "../../components/NotificationListScreen";

export default function StakeholderNotificationsScreen() {
  return (
    <NotificationListScreen
      title="Notifications"
      subtitle="Portfolio updates and activity highlights."
      routePrefix="/(stakeholder)"
    />
  );
}
