import { useAuth } from "../../contexts/AuthContext";
import { ROLES } from "../../constants/roles";
import RoleMoreScreen from "../../components/RoleMoreScreen";

export default function ClientMoreScreen() {
  const { currentUser, userProfile } = useAuth();

  return (
    <RoleMoreScreen
      title="More"
      subtitle="Quick links and account tools."
      userName={currentUser?.displayName || userProfile?.fullName || "Client"}
      role={(userProfile?.role || ROLES.CLIENT).toUpperCase()}
      sections={[
        {
          title: "Account",
          items: [
            {
              title: "All properties",
              description: "Browse the full property catalog and open any listing.",
              icon: "business-outline",
              route: "/(client)/properties",
            },
            {
              title: "My profile",
              description: "Update your contact details and account info.",
              icon: "person-outline",
              route: "/(client)/profile",
            },
            {
              title: "Notifications",
              description: "See your latest account and property alerts.",
              icon: "notifications-outline",
              route: "/(client)/notifications",
            },
            {
              title: "Messages",
              description: "Open your property conversations.",
              icon: "chatbubbles-outline",
              route: "/(client)/messages",
            },
            {
              title: "My bookings",
              description: "Review upcoming and past inspections.",
              icon: "calendar-outline",
              route: "/(client)/bookings",
            },
            {
              title: "Saved properties",
              description: "Open your shortlist of favourite homes.",
              icon: "heart-outline",
              route: "/(client)/saved",
            },
          ],
        },
      ]}
    />
  );
}
