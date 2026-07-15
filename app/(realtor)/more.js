import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../constants/roles";
import RoleMoreScreen from "../../components/RoleMoreScreen";

export default function RealtorMoreScreen() {
  const { currentUser, userProfile } = useAuth();

  return (
    <RoleMoreScreen
      title="More"
      subtitle="Manage the rest of your workspace."
      userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
      role={(userProfile?.role || ROLES.REALTOR).toUpperCase()}
      sections={[
        {
          title: "Workspace",
          items: [
            {
              title: "Messages",
              description: "Continue conversations with clients.",
              icon: "chatbubbles-outline",
              route: "/(realtor)/messages",
            },
            {
              title: "Bookings",
              description: "See inspection requests and updates.",
              icon: "calendar-outline",
              route: "/(realtor)/bookings",
            },
            {
              title: "Notifications",
              description: "Review alerts and account updates.",
              icon: "notifications-outline",
              route: "/(realtor)/notifications",
            },
            {
              title: "Profile",
              description: "Edit your account details.",
              icon: "person-outline",
              route: "/(realtor)/profile",
            },
          ],
        },
      ]}
    />
  );
}
