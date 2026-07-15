import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AppHeader from "../../../components/AppHeader";
import ConfirmDialog from "../../../components/ConfirmDialog";
import EmptyState from "../../../components/EmptyState";
import LoadingSpinner from "../../../components/LoadingSpinner";
import PrimaryButton from "../../../components/PrimaryButton";
import ScreenContainer from "../../../components/ScreenContainer";
import UserCard from "../../../components/UserCard";
import COLORS from "../../../constants/colors";
import { ROLES } from "../../../constants/roles";
import { useAuth } from "../../../contexts/AuthContext";
import {
  deleteUser,
  getUserById,
  updateUser,
} from "../../../services/userService";

const ROLE_OPTIONS = [
  ROLES.CLIENT,
  ROLES.STAFF,
  ROLES.REALTOR,
  ROLES.STAKEHOLDER,
  ROLES.ADMIN,
];

const STATUS_OPTIONS = ["active", "inactive"];

export default function AdminUserDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { currentUser, userProfile, refreshUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState(ROLES.CLIENT);
  const [status, setStatus] = useState("active");
  const [deleteVisible, setDeleteVisible] = useState(false);

  const isSelf = user?.uid && user.uid === currentUser?.uid;

  useEffect(() => {
    let active = true;

    async function loadUser() {
      setLoading(true);
      setError("");

      try {
        const item = await getUserById(String(params.id || ""));
        if (!item) {
          throw new Error("User not found.");
        }

        if (active) {
          setUser(item);
          setFullName(item.fullName || "");
          setPhone(item.phone || "");
          setRole(item.role || ROLES.CLIENT);
          setStatus(item.status || "active");
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load this user.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      active = false;
    };
  }, [params.id]);

  async function handleSave() {
    if (!user) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updated = await updateUser(user.uid, {
        fullName,
        phone,
        role: isSelf ? user.role : role,
        status: isSelf ? user.status : status,
      }, {
        allowRoleStatus: !isSelf,
        actorUid: currentUser?.uid,
      });

      setUser(updated);
      if (updated.uid === currentUser?.uid) {
        await refreshUser();
      }
      Alert.alert("User updated", "The account changes have been saved.");
    } catch (err) {
      setError(err?.message || "Unable to update this user.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user || isSelf) {
      return;
    }

    try {
      await deleteUser(user.uid);
      router.replace("/(admin)/users");
    } catch (err) {
      setError(err?.message || "Unable to delete this user.");
    }
  }

  const summary = useMemo(() => {
    if (!user) {
      return null;
    }

    return (
      <UserCard
        user={user}
        onPress={undefined}
      />
    );
  }, [user]);

  if (loading) {
    return <LoadingSpinner label="Loading user details..." />;
  }

  if (!user || error) {
    return (
      <ScreenContainer contentContainerStyle={styles.container}>
        <AppHeader
          title="User Details"
          subtitle="Edit account information and access controls."
          userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
          role={(userProfile?.role || "admin").toUpperCase()}
        />
        <EmptyState
          title="Could not load user"
          description={error || "The user may have been removed."}
          actionLabel="Back to users"
          onAction={() => router.back()}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="User Details"
        subtitle="Edit account information and access controls."
        userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
        role={(userProfile?.role || "admin").toUpperCase()}
      />

      {summary}

      <View style={styles.metaCard}>
        <Text style={styles.sectionTitle}>Account metadata</Text>
        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Role</Text>
          <Text style={styles.metaValue}>{String(user.role || "-").toUpperCase()}</Text>
          <Text style={styles.metaLabel}>Status</Text>
          <Text style={styles.metaValue}>{String(user.status || "-").toUpperCase()}</Text>
          <Text style={styles.metaLabel}>Creation method</Text>
          <Text style={styles.metaValue}>{user.creationMethod || "-"}</Text>
          <Text style={styles.metaLabel}>Must change password</Text>
          <Text style={styles.metaValue}>{user.mustChangePassword ? "Yes" : "No"}</Text>
          <Text style={styles.metaLabel}>Created by</Text>
          <Text style={styles.metaValue}>{user.createdBy || "-"}</Text>
          <Text style={styles.metaLabel}>Password changed at</Text>
          <Text style={styles.metaValue}>
            {user.passwordChangedAt ? new Date(user.passwordChangedAt).toLocaleString("en-NG") : "-"}
          </Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>Edit user</Text>

        <Text style={styles.fieldLabel}>Full Name</Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
          placeholder="Full name"
          placeholderTextColor={COLORS.placeholder}
        />

        <Text style={styles.fieldLabel}>Phone Number</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
          placeholder="Phone number"
          placeholderTextColor={COLORS.placeholder}
        />

        <Text style={styles.fieldLabel}>Role</Text>
        <View style={styles.optionRow}>
          {ROLE_OPTIONS.map((item) => {
            const active = item === role;
            const disabled = isSelf;

            return (
              <Pressable
                key={item}
                disabled={disabled}
                onPress={() => setRole(item)}
                style={[
                  styles.optionChip,
                  active ? styles.optionChipActive : null,
                  disabled ? styles.optionChipDisabled : null,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    active ? styles.optionTextActive : null,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.fieldLabel}>Status</Text>
        <View style={styles.optionRow}>
          {STATUS_OPTIONS.map((item) => {
            const active = item === status;
            const disabled = isSelf;

            return (
              <Pressable
                key={item}
                disabled={disabled}
                onPress={() => setStatus(item)}
                style={[
                  styles.optionChip,
                  active ? styles.optionChipActive : null,
                  disabled ? styles.optionChipDisabled : null,
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    active ? styles.optionTextActive : null,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.metaBlock}>
          <Text style={styles.metaLabel}>Email</Text>
          <Text style={styles.metaValue}>{user.email}</Text>
          <Text style={styles.metaLabel}>Created</Text>
          <Text style={styles.metaValue}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-NG") : "-"}</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <PrimaryButton title="Save changes" onPress={handleSave} loading={saving} />

        {!isSelf ? (
          <PrimaryButton
            title="Delete user"
            onPress={() => setDeleteVisible(true)}
            variant="secondary"
          />
        ) : null}
      </View>

      <ConfirmDialog
        visible={deleteVisible}
        title="Delete user?"
        description="This removes the user document only after confirmation. The action cannot be undone."
        confirmLabel="Delete"
        onConfirm={async () => {
          setDeleteVisible(false);
          await handleDelete();
        }}
        onCancel={() => setDeleteVisible(false)}
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
  formCard: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 12,
  },
  metaCard: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 16,
    fontSize: 15,
    color: COLORS.text,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionChipDisabled: {
    opacity: 0.6,
  },
  optionText: {
    color: COLORS.mutedText,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  optionTextActive: {
    color: COLORS.white,
  },
  metaBlock: {
    gap: 2,
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
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "700",
  },
});
