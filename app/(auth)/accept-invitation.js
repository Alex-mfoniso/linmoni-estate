import { useRouter } from "expo-router";
import AuthShell from "../../components/AuthShell";
import EmptyState from "../../components/EmptyState";
import { AUTH_ROUTES } from "../../utils/authRoutes";
export default function AcceptInvitationScreen() { const router = useRouter(); return <AuthShell title="Internal invitations" subtitle="Trusted internal account activation is not available in Phase B."><EmptyState title="Secure invitation workflow deferred" description="This local flow can no longer create realtor, staff, stakeholder, or admin roles. A server-administered invitation endpoint is required in a later phase." actionLabel="Back to sign in" onAction={() => router.replace(AUTH_ROUTES.LOGIN)} /></AuthShell>; }
