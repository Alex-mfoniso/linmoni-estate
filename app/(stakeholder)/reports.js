import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import PlaceholderScreen from "../../components/PlaceholderScreen";

export default function StakeholderReportsScreen() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();

  return (
    <PlaceholderScreen
      title="Reports"
      subtitle="View portfolio summaries and updates."
      userName={currentUser?.displayName || userProfile?.fullName || "Stakeholder"}
      role={(userProfile?.role || "stakeholder").toUpperCase()}
      actionLabel="Open properties"
      onAction={() => router.push("/(stakeholder)/properties")}
      emptyTitle="Reports"
      emptyDescription="Reporting dashboards will arrive in a later phase."
    />
  );
}
