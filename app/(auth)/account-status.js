import { Alert } from "react-native";
import AuthShell from "../../components/AuthShell";
import ErrorState from "../../components/ErrorState";
import PrimaryButton from "../../components/PrimaryButton";
import { useAuth } from "../../contexts/AuthContext";

const copy = {
  disabled: ["Account unavailable", "This account is currently unavailable. Contact LINPAL support if you believe this is an error."],
  suspended: ["Account suspended", "Protected access is paused. Contact LINPAL support for assistance."],
  invited: ["Invitation incomplete", "This internal invitation must be completed through a trusted server workflow."],
  unknown_role: ["Role unavailable", "This account does not have a recognized LINPAL role. Contact support."],
};
export default function AccountStatusScreen() {
  const { authResolution, firebaseUser, logout } = useAuth(); const [title, description] = copy[authResolution] || copy.unknown_role;
  return <AuthShell title={title} subtitle={firebaseUser?.email || "Signed-in account"}>
    <ErrorState title={title} description={description} actionLabel="Contact support" onAction={() => Alert.alert("Support", "LINPAL support contact options will be connected in a later backend phase.")} />
    <PrimaryButton title="Sign out" variant="secondary" onPress={logout} />
  </AuthShell>;
}
