import { useAuth } from "../../contexts/AuthContext";
import { getDashboardContent } from "../../utils/dashboardContent";
import DashboardScreen from "../../components/DashboardScreen";
import { ROLES } from "../../constants/roles";

export default function StaffDashboard() {
  const { currentUser, userProfile } = useAuth();
  const content = getDashboardContent(ROLES.STAFF);

  return (
    <DashboardScreen
      title={content.title}
      subtitle={content.subtitle}
      userName={currentUser?.displayName || userProfile?.fullName || "Staff"}
      roleLabel={(userProfile?.role || ROLES.STAFF).toUpperCase()}
      stats={content.stats}
      cards={content.cards}
    />
  );
}
