import { Redirect } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import LoadingSpinner from "./LoadingSpinner";
import { getDashboardRouteForRole } from "../utils/authRoutes";

export default function ProtectedGroup({ role, children }) {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Checking access..." />;
  }

  if (!currentUser) {
    return <Redirect href="/login" />;
  }

  const currentRole = userProfile?.role;

  if (!currentRole) {
    return <Redirect href="/login" />;
  }

  if (currentRole !== role) {
    return (
      <Redirect href={getDashboardRouteForRole(currentRole) ?? "/login"} />
    );
  }

  return children;
}
