import { useAuth } from "../../contexts/AuthContext";
import { getDashboardLayout } from "../../utils/dashboardLayout";
import DashboardScreen from "../../components/DashboardScreen";
import { ROLES } from "../../constants/roles";

export default function ClientDashboard() {
  const { currentUser, userProfile } = useAuth();
  const content = getDashboardLayout(ROLES.CLIENT);

  return (
    <DashboardScreen
      {...content}
      userName={currentUser?.displayName || userProfile?.fullName || "Client"}
      roleLabel={(userProfile?.role || ROLES.CLIENT).toUpperCase()}
    />
  );
}
