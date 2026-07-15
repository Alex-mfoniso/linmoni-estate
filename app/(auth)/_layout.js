import { Redirect, Stack } from "expo-router";
import FullScreenLoader from "../../components/FullScreenLoader";
import { useAuth } from "../../contexts/AuthContext";
import { getDashboardRouteForRole } from "../../utils/authRoutes";

export default function AuthLayout() {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader message="Checking your session..." />;
  }

  if (currentUser) {
    return (
      <Redirect href={getDashboardRouteForRole(userProfile?.role) ?? "/login"} />
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
