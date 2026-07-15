import { useAuth } from "../../contexts/AuthContext";
import { getDashboardContent } from "../../utils/dashboardContent";
import DashboardScreen from "../../components/DashboardScreen";
import { ROLES } from "../../constants/roles";

export default function AdminDashboard() {
  const { currentUser, userProfile } = useAuth();
  const content = getDashboardContent(ROLES.ADMIN);

  return (
    <DashboardScreen
      title={content.title}
      subtitle={content.subtitle}
      userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
      roleLabel={(userProfile?.role || ROLES.ADMIN).toUpperCase()}
      stats={content.stats}
      cards={content.cards}
    />
  );
}
