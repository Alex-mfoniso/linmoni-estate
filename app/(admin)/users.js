import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "../../components/AppHeader";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import ScreenContainer from "../../components/ScreenContainer";
import UserCard from "../../components/UserCard";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { getUsers } from "../../services/userService";

export default function AdminUsersScreen() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadUsers() {
      setLoading(true);
      setError("");

      try {
        const items = await getUsers();
        const visibleUsers = items.filter((user) => user.uid !== currentUser?.uid);
        if (active) {
          setUsers(visibleUsers);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load users.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      active = false;
    };
  }, [currentUser?.uid, refreshTick]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return users;
    }

    return users.filter((user) => {
      const haystack = [
        user.fullName,
        user.email,
        user.phone,
        user.role,
        user.status,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [search, users]);

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="Users"
        subtitle="Review platform accounts and open user details."
        userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
        role={(userProfile?.role || "admin").toUpperCase()}
      />

      <View style={styles.searchWrap}>
        <Text style={styles.sectionLabel}>Search users</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, email, phone, role, or status"
          placeholderTextColor={COLORS.placeholder}
          style={styles.searchInput}
          autoCapitalize="none"
        />
      </View>

      {loading ? <LoadingSpinner label="Loading users..." /> : null}

      {!loading && error ? (
        <EmptyState
          title="We could not load users"
          description={error}
          actionLabel="Try again"
          onAction={() => setRefreshTick((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && filteredUsers.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try a different search term."
        />
      ) : null}

      {!loading && !error
        ? filteredUsers.map((user) => (
            <UserCard
              key={user.uid}
              user={user}
              onPress={() => router.push(`/(admin)/users/${user.uid}`)}
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
});
