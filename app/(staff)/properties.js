import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import PlaceholderScreen from "../../components/PlaceholderScreen";

export default function StaffPropertiesScreen() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();

  return (
    <PlaceholderScreen
      title="Properties"
      subtitle="Review property operations and status."
      userName={currentUser?.displayName || userProfile?.fullName || "Staff"}
      role={(userProfile?.role || "staff").toUpperCase()}
      actionLabel="Open home"
      onAction={() => router.push("/(staff)/dashboard")}
      emptyTitle="Properties"
      emptyDescription="This is a placeholder for staff property oversight."
    />
  );
}
