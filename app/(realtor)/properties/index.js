import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import EmptyState from "../../../components/EmptyState";
import LoadingSpinner from "../../../components/LoadingSpinner";
import PrimaryButton from "../../../components/PrimaryButton";
import PropertyCard from "../../../components/PropertyCard";
import ScreenContainer from "../../../components/ScreenContainer";
import AppHeader from "../../../components/AppHeader";
import COLORS from "../../../constants/colors";
import { useAuth } from "../../../contexts/AuthContext";
import { deleteProperty, getProperties } from "../../../services/propertyService";

const STATUS_FILTERS = ["all", "available", "rented", "sold", "draft"];

export default function RealtorPropertiesScreen() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadProperties() {
      setLoading(true);
      setError("");

      try {
        const items = await getProperties({
          search,
          status,
          createdBy: currentUser?.uid,
        });

        if (active) {
          setProperties(items);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load your properties.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProperties();

    return () => {
      active = false;
    };
  }, [currentUser?.uid, search, status, refreshTick]);

  async function handleDelete(property) {
    Alert.alert("Delete property", `Remove ${property.title} from your listings?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProperty(property.id);
            const items = await getProperties({
              search,
              status,
              createdBy: currentUser?.uid,
            });
            setError("");
            setProperties(items);
          } catch (err) {
            setError(err?.message || "Unable to delete this property.");
          }
        },
      },
    ]);
  }

  const emptyMessage = useMemo(() => {
    if (search || status !== "all") {
      return "Try a different search or status filter.";
    }

    return "You have not added any property records yet.";
  }, [search, status]);

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="My Properties"
        subtitle="Manage your listings, add a new property, or update existing ones."
        userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
        role={(userProfile?.role || "realtor").toUpperCase()}
      />

      <View style={styles.toolbar}>
        <View style={styles.searchWrap}>
          <Text style={styles.sectionLabel}>Search</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search your properties"
            placeholderTextColor={COLORS.placeholder}
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>

        <PrimaryButton
          title="Add property"
          onPress={() => router.push("/(realtor)/properties/new")}
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
              <Text
                style={[
                  styles.filterText,
                  active ? styles.filterTextActive : null,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {loading ? <LoadingSpinner label="Loading your properties..." /> : null}

      {!loading && error ? (
        <EmptyState
          title="We could not load your properties"
          description={error}
          actionLabel="Try again"
          onAction={() => setRefreshTick((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && properties.length === 0 ? (
        <EmptyState
          title="No properties yet"
          description={emptyMessage}
          actionLabel="Add property"
          onAction={() => router.push("/(realtor)/properties/new")}
        />
      ) : null}

      {!loading && !error
        ? properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onPrimaryAction={() =>
                router.push(`/(realtor)/properties/${property.id}/edit`)
              }
              primaryActionLabel="Edit"
              onSecondaryAction={() => handleDelete(property)}
              secondaryActionLabel="Delete"
              onView={() => router.push(`/(realtor)/properties/${property.id}`)}
            />
          ))
        : null}

      <Pressable
        onPress={() => router.push("/(realtor)/properties/new")}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Ionicons name="add" size={22} color={COLORS.white} />
      </Pressable>
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
  fab: {
    position: "absolute",
    right: 18,
    bottom: 18,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: COLORS.primary,
    ...{
      shadowColor: "#000",
      shadowOpacity: 0.16,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
  },
  fabPressed: {
    transform: [{ scale: 0.96 }],
  },
});
