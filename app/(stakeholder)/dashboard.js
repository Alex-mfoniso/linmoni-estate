import { useAuth } from "../../contexts/AuthContext";
import { getDashboardLayout } from "../../utils/dashboardLayout";
import DashboardScreen from "../../components/DashboardScreen";
import { ROLES } from "../../constants/roles";

export default function StakeholderDashboard() {
  const { currentUser, userProfile } = useAuth();
  const content = getDashboardLayout(ROLES.STAKEHOLDER);

  return (
    <DashboardScreen
      {...content}
      userName={
        currentUser?.displayName || userProfile?.fullName || "Stakeholder"
      }
      roleLabel={(userProfile?.role || ROLES.STAKEHOLDER).toUpperCase()}
    />
  );
}
