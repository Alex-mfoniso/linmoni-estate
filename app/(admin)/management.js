import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../constants/roles";
import RoleMoreScreen from "../../components/RoleMoreScreen";

export default function AdminManagementScreen() {
  const { currentUser, userProfile } = useAuth();

  return (
    <RoleMoreScreen
      title="Management"
      subtitle="Quick access to admin controls."
      userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
      role={(userProfile?.role || ROLES.ADMIN).toUpperCase()}
      sections={[
        {
          title: "Platform",
          items: [
            {
              title: "Create User",
              description: "Add an internal account or send an invitation.",
              icon: "person-add-outline",
              route: "/(admin)/users/create",
            },
            {
              title: "Invitations",
              description: "Review pending and accepted invitations.",
              icon: "mail-outline",
              route: "/(admin)/invitations",
            },
            {
              title: "Users",
              description: "Review and manage user accounts.",
              icon: "people-outline",
              route: "/(admin)/users",
            },
            {
              title: "Properties",
              description: "Review the property catalogue.",
              icon: "business-outline",
              route: "/(admin)/properties",
            },
            {
              title: "Bookings",
              description: "Review inspection requests.",
              icon: "calendar-outline",
              route: "/(admin)/bookings",
            },
            {
              title: "Messages",
              description: "Open conversation moderation metadata.",
              icon: "chatbubbles-outline",
              route: "/(admin)/messages",
            },
            {
              title: "Notifications",
              description: "Review admin alerts and system updates.",
              icon: "notifications-outline",
              route: "/(admin)/notifications",
            },
          ],
        },
      ]}
    />
  );
}
