import { useAuth } from "../../contexts/AuthContext";
import { getDashboardContent } from "../../utils/dashboardContent";
import DashboardScreen from "../../components/DashboardScreen";
import { ROLES } from "../../constants/roles";

export default function RealtorDashboard() {
  const { currentUser, userProfile } = useAuth();
  const content = getDashboardContent(ROLES.REALTOR);

  return (
    <DashboardScreen
      title={content.title}
      subtitle={content.subtitle}
      userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
      roleLabel={(userProfile?.role || ROLES.REALTOR).toUpperCase()}
      stats={content.stats}
      cards={content.cards}
    />
  );
}
