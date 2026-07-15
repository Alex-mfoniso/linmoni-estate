import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import PlaceholderScreen from "../../components/PlaceholderScreen";

export default function StakeholderPropertiesScreen() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();

  return (
    <PlaceholderScreen
      title="Properties"
      subtitle="Monitor the shared property portfolio."
      userName={currentUser?.displayName || userProfile?.fullName || "Stakeholder"}
      role={(userProfile?.role || "stakeholder").toUpperCase()}
      actionLabel="Back to home"
      onAction={() => router.push("/(stakeholder)/dashboard")}
      emptyTitle="Properties"
      emptyDescription="Stakeholder property insights are reserved for later."
    />
  );
}
