import { useState } from "react";
import { Text } from "react-native";
import AuthShell from "../../components/AuthShell";
import ErrorState from "../../components/ErrorState";
import PrimaryButton from "../../components/PrimaryButton";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
export default function ProfileRecoveryScreen() {
  const { authResolution, retryProfileCreation, refreshProfile, logout } = useAuth(); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function retry() { setLoading(true); setError(""); try { authResolution === "profile_creation_failed" ? await retryProfileCreation() : await refreshProfile(); } catch (e) { setError(e.message); } finally { setLoading(false); } }
  return <AuthShell title="Finish account setup" subtitle="Your Firebase account is safe, but its LINPAL profile is not ready yet.">
    <ErrorState title="Profile setup incomplete" description="Retry the secure profile link. No password is stored or resent." actionLabel={loading ? "Retrying..." : "Retry profile setup"} onAction={retry} />
    {error ? <Text style={{ color: COLORS.error }}>{error}</Text> : null}<PrimaryButton title="Sign out" variant="secondary" onPress={logout} />
  </AuthShell>;
}
