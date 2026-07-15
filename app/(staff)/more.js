import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../constants/roles";
import RoleMoreScreen from "../../components/RoleMoreScreen";

export default function StaffMoreScreen() {
  const { currentUser, userProfile } = useAuth();

  return (
    <RoleMoreScreen
      title="More"
      subtitle="Additional staff tools and account access."
      userName={currentUser?.displayName || userProfile?.fullName || "Staff"}
      role={(userProfile?.role || ROLES.STAFF).toUpperCase()}
      sections={[
        {
          title: "Account",
          items: [
            {
              title: "Messages",
              description: "Follow up on conversations with clients.",
              icon: "chatbubbles-outline",
              route: "/(staff)/messages",
            },
            {
              title: "Notifications",
              description: "Keep track of staff alerts and updates.",
              icon: "notifications-outline",
              route: "/(staff)/notifications",
            },
            {
              title: "Profile",
              description: "Update your staff account details.",
              icon: "person-outline",
              route: "/(staff)/profile",
            },
          ],
        },
      ]}
    />
  );
}
