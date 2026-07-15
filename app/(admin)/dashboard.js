import { useAuth } from "../../contexts/AuthContext";
import { getDashboardLayout } from "../../utils/dashboardLayout";
import DashboardScreen from "../../components/DashboardScreen";
import { ROLES } from "../../constants/roles";

export default function AdminDashboard() {
  const { currentUser, userProfile } = useAuth();
  const content = getDashboardLayout(ROLES.ADMIN);

  return (
    <DashboardScreen
      {...content}
      userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
      roleLabel={(userProfile?.role || ROLES.ADMIN).toUpperCase()}
    />
  );
}
