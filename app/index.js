import { Redirect } from "expo-router";
import FullScreenLoader from "../components/FullScreenLoader";
import { useAuth } from "../contexts/AuthContext";
import { getDashboardRouteForRole } from "../utils/authRoutes";

export default function Index() {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader message="Preparing your account..." />;
  }

  if (currentUser) {
    const dashboardRoute = getDashboardRouteForRole(userProfile?.role);

    if (dashboardRoute) {
      return <Redirect href={dashboardRoute} />;
    }
  }

  return <Redirect href="/login" />;
}
