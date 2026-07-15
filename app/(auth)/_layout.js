import { Redirect, Stack, usePathname } from "expo-router";
import FullScreenLoader from "../../components/FullScreenLoader";
import { useAuth } from "../../contexts/AuthContext";
import { AUTH_ROUTES, getDashboardRouteForRole } from "../../utils/authRoutes";

export default function AuthLayout() {
  const { currentUser, userProfile, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <FullScreenLoader message="Checking your session..." />;
  }

  if (currentUser) {
    if (userProfile?.mustChangePassword) {
      if (pathname === AUTH_ROUTES.CHANGE_TEMPORARY_PASSWORD) {
        return <Stack screenOptions={{ headerShown: false }} />;
      }

      return <Redirect href={AUTH_ROUTES.CHANGE_TEMPORARY_PASSWORD} />;
    }

    return (
      <Redirect href={getDashboardRouteForRole(userProfile?.role) ?? "/login"} />
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
