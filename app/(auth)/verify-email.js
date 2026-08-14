import { useEffect, useState } from "react";
import { StyleSheet, Text } from "react-native";
import AuthShell from "../../components/AuthShell";
import PrimaryButton from "../../components/PrimaryButton";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";
export default function VerifyEmailScreen() {
  const { firebaseUser, resendVerificationEmail, refreshVerificationStatus, logout } = useAuth(); const [cooldown, setCooldown] = useState(0); const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  useEffect(() => { if (!cooldown) return undefined; const timer = setInterval(() => setCooldown((v) => Math.max(0, v - 1)), 1000); return () => clearInterval(timer); }, [cooldown]);
  async function resend() { setError(""); try { await resendVerificationEmail(); setCooldown(60); setMessage("Verification email sent."); } catch (e) { setError(getFriendlyErrorMessage(e)); } }
  async function refresh() { setLoading(true); setError(""); try { await refreshVerificationStatus(); } catch (e) { setError(getFriendlyErrorMessage(e)); } finally { setLoading(false); } }
  return <AuthShell title="Verify your email" subtitle={`A verification link was sent to ${firebaseUser?.email || "your signed-in email"}.`}>{message ? <Text style={styles.success}>{message}</Text> : null}{error ? <Text style={styles.error}>{error}</Text> : null}<PrimaryButton title="I've verified my email" onPress={refresh} loading={loading} /><PrimaryButton title={cooldown ? `Resend in ${cooldown}s` : "Resend verification email"} variant="secondary" onPress={resend} disabled={Boolean(cooldown)} /><PrimaryButton title="Sign out" variant="secondary" onPress={logout} /></AuthShell>;
}
const styles = StyleSheet.create({ success: { color: COLORS.success, fontWeight: "700" }, error: { color: COLORS.error, fontWeight: "700" } });
