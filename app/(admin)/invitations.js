import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "../../components/AppHeader";
import EmptyState from "../../components/EmptyState";
import InvitationCard from "../../components/InvitationCard";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import SkeletonList from "../../components/SkeletonList";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { getInvitationList } from "../../services/adminApiService";

const STATUS_FILTERS = ["all", "pending", "accepted", "expired", "revoked"];

export default function AdminInvitationsScreen() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadInvitations() {
      setLoading(true);
      setError("");

      try {
        const items = await getInvitationList({ search, status });
        if (active) {
          setInvitations(items);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load invitations.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInvitations();

    return () => {
      active = false;
    };
  }, [search, status, refreshTick]);

  const emptyMessage = useMemo(() => {
    if (search || status !== "all") {
      return "Try a different search or status filter.";
    }

    return "No invitations have been created yet.";
  }, [search, status]);

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="Invitations"
        subtitle="Review, resend, and revoke internal user invitations."
        userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
        role={(userProfile?.role || "admin").toUpperCase()}
      />

      <View style={styles.toolbar}>
        <View style={styles.searchWrap}>
          <Text style={styles.sectionLabel}>Search invitations</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, email, phone, or role"
            placeholderTextColor={COLORS.placeholder}
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>

        <PrimaryButton
          title="Create User"
          onPress={() => router.push("/(admin)/users/create")}
        />
      </View>

      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((item) => {
          const active = item === status;

          return (
            <Pressable
              key={item}
              onPress={() => setStatus(item)}
              style={[styles.filterChip, active ? styles.filterChipActive : null]}
            >
              <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? <SkeletonList count={4} /> : null}

      {!loading && error ? (
        <EmptyState
          title="We could not load invitations"
          description={error}
          actionLabel="Try again"
          onAction={() => setRefreshTick((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && invitations.length === 0 ? (
        <EmptyState
          title="No invitations found"
          description={emptyMessage}
          actionLabel="Create user"
          onAction={() => router.push("/(admin)/users/create")}
        />
      ) : null}

      {!loading && !error
        ? invitations.map((invitation) => (
            <InvitationCard
              key={invitation.id}
              invitation={invitation}
              onPress={() => router.push(`/(admin)/invitations/${invitation.id}`)}
            />
          ))
        : null}
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
  toolbar: {
    gap: 12,
  },
  searchWrap: {
    gap: 8,
  },
  sectionLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  searchInput: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.text,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    color: COLORS.mutedText,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  filterTextActive: {
    color: COLORS.white,
  },
});
