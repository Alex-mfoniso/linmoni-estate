import { useEffect, useMemo, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppHeader from "../../../components/AppHeader";
import ConfirmDialog from "../../../components/ConfirmDialog";
import EmptyState from "../../../components/EmptyState";
import LoadingSpinner from "../../../components/LoadingSpinner";
import PrimaryButton from "../../../components/PrimaryButton";
import ScreenContainer from "../../../components/ScreenContainer";
import StatusBadge from "../../../components/StatusBadge";
import COLORS from "../../../constants/colors";
import { useAuth } from "../../../contexts/AuthContext";
import {
  getInvitationRequestById,
  resendInvitationRequest,
  revokeInvitationRequest,
} from "../../../services/adminApiService";

export default function AdminInvitationDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentUser, userProfile } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [revokeVisible, setRevokeVisible] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadInvitation() {
      setLoading(true);
      setError("");

      try {
        const item = await getInvitationRequestById(String(params.id || ""));
        if (!item) {
          throw new Error("Invitation not found.");
        }

        if (active) {
          setInvitation(item);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load this invitation.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInvitation();

    return () => {
      active = false;
    };
  }, [params.id, busy]);

  const createdAtLabel = useMemo(() => {
    if (!invitation?.createdAt) {
      return "-";
    }

    return new Date(invitation.createdAt).toLocaleString("en-NG");
  }, [invitation?.createdAt]);

  const expiresAtLabel = useMemo(() => {
    if (!invitation?.expiresAt) {
      return "-";
    }

    return new Date(invitation.expiresAt).toLocaleString("en-NG");
  }, [invitation?.expiresAt]);

  async function handleResend() {
    if (!invitation) {
      return;
    }

    setBusy(true);
    try {
      const result = await resendInvitationRequest(invitation.id, currentUser?.uid);
      setInvitation(result.invitation);
      Alert.alert("Invitation resent", result.invitationUrl);
    } catch (err) {
      setError(err?.message || "Unable to resend this invitation.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke() {
    if (!invitation) {
      return;
    }

    setBusy(true);
    try {
      const result = await revokeInvitationRequest(invitation.id, currentUser?.uid);
      setInvitation(result);
      Alert.alert("Invitation revoked", "The invitation is no longer usable.");
    } catch (err) {
      setError(err?.message || "Unable to revoke this invitation.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading invitation details..." />;
  }

  if (!invitation || error) {
    return (
      <ScreenContainer contentContainerStyle={styles.container}>
        <AppHeader
          title="Invitation Details"
          subtitle="Review invitation metadata and actions."
          userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
          role={(userProfile?.role || "admin").toUpperCase()}
        />
        <EmptyState
          title="Could not load invitation"
          description={error || "The invitation may have been removed."}
          actionLabel="Back to invitations"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="Invitation Details"
        subtitle="Review invitation metadata and actions."
        userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
        role={(userProfile?.role || "admin").toUpperCase()}
      />

      <View style={styles.card}>
        <Text style={styles.name}>{invitation.fullName}</Text>
        <Text style={styles.email}>{invitation.email}</Text>
        <View style={styles.badgeRow}>
          <StatusBadge label={invitation.role} variant="neutral" />
          <StatusBadge label={invitation.status} variant="subtle" />
          <StatusBadge
            label={invitation.accountStatus || "active"}
            variant={
              String(invitation.accountStatus || "active").toLowerCase() === "active"
                ? "success"
                : "subtle"
            }
          />
        </View>

        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Phone</Text>
          <Text style={styles.metaValue}>{invitation.phone || "-"}</Text>
          <Text style={styles.metaLabel}>Created</Text>
          <Text style={styles.metaValue}>{createdAtLabel}</Text>
          <Text style={styles.metaLabel}>Expires</Text>
          <Text style={styles.metaValue}>{expiresAtLabel}</Text>
          <Text style={styles.metaLabel}>Resend Count</Text>
          <Text style={styles.metaValue}>{String(invitation.resendCount || 0)}</Text>
          <Text style={styles.metaLabel}>Target account status</Text>
          <Text style={styles.metaValue}>{String(invitation.accountStatus || "active").toUpperCase()}</Text>
        </View>

        <PrimaryButton title="Resend invitation" onPress={handleResend} loading={busy} />
        <PrimaryButton
          title="Revoke invitation"
          onPress={() => setRevokeVisible(true)}
          variant="secondary"
          disabled={invitation.status === "revoked" || invitation.status === "accepted"}
        />
      </View>

      <ConfirmDialog
        visible={revokeVisible}
        title="Revoke invitation?"
        description="This prevents the invitation link from being used again."
        confirmLabel="Revoke"
        onConfirm={async () => {
          setRevokeVisible(false);
          await handleRevoke();
        }}
        onCancel={() => setRevokeVisible(false)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 14,
  },
  card: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 12,
  },
  name: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  email: {
    color: COLORS.mutedText,
    fontSize: 13,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaBlock: {
    gap: 4,
  },
  metaLabel: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  metaValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
});
