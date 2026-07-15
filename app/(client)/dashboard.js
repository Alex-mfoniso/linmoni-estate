import { useAuth } from "../../contexts/AuthContext";
import { getDashboardContent } from "../../utils/dashboardContent";
import DashboardScreen from "../../components/DashboardScreen";
import { ROLES } from "../../constants/roles";

export default function ClientDashboard() {
  const { currentUser, userProfile } = useAuth();
  const content = getDashboardContent(ROLES.CLIENT);

  return (
    <DashboardScreen
      title={content.title}
      subtitle={content.subtitle}
      userName={currentUser?.displayName || userProfile?.fullName || "Client"}
      roleLabel={(userProfile?.role || ROLES.CLIENT).toUpperCase()}
      stats={content.stats}
      cards={content.cards}
    />
  );
}
