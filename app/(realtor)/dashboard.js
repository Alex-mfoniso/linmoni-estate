import { useAuth } from "../../contexts/AuthContext";
import { getDashboardLayout } from "../../utils/dashboardLayout";
import DashboardScreen from "../../components/DashboardScreen";
import { ROLES } from "../../constants/roles";

export default function RealtorDashboard() {
  const { currentUser, userProfile } = useAuth();
  const content = getDashboardLayout(ROLES.REALTOR);

  return (
    <DashboardScreen
      {...content}
      userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
      roleLabel={(userProfile?.role || ROLES.REALTOR).toUpperCase()}
    />
  );
}
