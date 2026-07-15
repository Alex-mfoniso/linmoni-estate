import { useAuth } from "../../contexts/AuthContext";
import { getDashboardContent } from "../../utils/dashboardContent";
import DashboardScreen from "../../components/DashboardScreen";
import { ROLES } from "../../constants/roles";

export default function StakeholderDashboard() {
  const { currentUser, userProfile } = useAuth();
  const content = getDashboardContent(ROLES.STAKEHOLDER);

  return (
    <DashboardScreen
      title={content.title}
      subtitle={content.subtitle}
      userName={
        currentUser?.displayName || userProfile?.fullName || "Stakeholder"
      }
      roleLabel={(userProfile?.role || ROLES.STAKEHOLDER).toUpperCase()}
      stats={content.stats}
      cards={content.cards}
    />
  );
}
