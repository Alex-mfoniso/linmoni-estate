import { useAuth } from "../../contexts/AuthContext";
import { getDashboardLayout } from "../../utils/dashboardLayout";
import DashboardScreen from "../../components/DashboardScreen";
import { ROLES } from "../../constants/roles";

export default function StaffDashboard() {
  const { currentUser, userProfile } = useAuth();
  const content = getDashboardLayout(ROLES.STAFF);

  return (
    <DashboardScreen
      {...content}
      userName={currentUser?.displayName || userProfile?.fullName || "Staff"}
      roleLabel={(userProfile?.role || ROLES.STAFF).toUpperCase()}
    />
  );
}
