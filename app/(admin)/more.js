import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../constants/roles";
import RoleMoreScreen from "../../components/RoleMoreScreen";

export default function AdminMoreScreen() {
  const { currentUser, userProfile } = useAuth();

  return (
    <RoleMoreScreen
      title="More"
      subtitle="Platform controls and support tools."
      userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
      role={(userProfile?.role || ROLES.ADMIN).toUpperCase()}
      sections={[
        {
          title: "Management",
          items: [
            {
              title: "Messages",
              description: "Review platform conversations.",
              icon: "chatbubbles-outline",
              route: "/(admin)/messages",
            },
            {
              title: "Bookings",
              description: "Review all inspection requests.",
              icon: "calendar-outline",
              route: "/(admin)/bookings",
            },
            {
              title: "Analytics",
              description: "Open platform performance summaries.",
              icon: "stats-chart-outline",
              route: "/(admin)/analytics",
            },
            {
              title: "Notifications",
              description: "Review system and user alerts.",
              icon: "notifications-outline",
              route: "/(admin)/notifications",
            },
            {
              title: "Profile",
              description: "Manage the admin account.",
              icon: "person-outline",
              route: "/(admin)/profile",
            },
          ],
        },
      ]}
    />
  );
}
