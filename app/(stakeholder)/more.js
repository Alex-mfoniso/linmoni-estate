import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../constants/roles";
import RoleMoreScreen from "../../components/RoleMoreScreen";

export default function StakeholderMoreScreen() {
  const { currentUser, userProfile } = useAuth();

  return (
    <RoleMoreScreen
      title="More"
      subtitle="Portfolio access and account tools."
      userName={currentUser?.displayName || userProfile?.fullName || "Stakeholder"}
      role={(userProfile?.role || ROLES.STAKEHOLDER).toUpperCase()}
      sections={[
        {
          title: "Account",
          items: [
            {
              title: "Profile",
              description: "Manage your stakeholder account.",
              icon: "person-outline",
              route: "/(stakeholder)/profile",
            },
            {
              title: "Notifications",
              description: "See portfolio alerts and platform updates.",
              icon: "notifications-outline",
              route: "/(stakeholder)/notifications",
            },
          ],
        },
      ]}
    />
  );
}
