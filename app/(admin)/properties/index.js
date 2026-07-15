import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import EmptyState from "../../../components/EmptyState";
import LoadingSpinner from "../../../components/LoadingSpinner";
import PropertyCard from "../../../components/PropertyCard";
import ScreenContainer from "../../../components/ScreenContainer";
import AppHeader from "../../../components/AppHeader";
import COLORS from "../../../constants/colors";
import { useAuth } from "../../../contexts/AuthContext";
import { deleteProperty, getProperties } from "../../../services/propertyService";

const STATUS_FILTERS = ["all", "available", "rented", "sold", "draft"];

export default function AdminPropertiesScreen() {
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
        const items = await getProperties({ search, status });
        if (active) {
          setProperties(items);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load properties.");
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
  }, [search, status, refreshTick]);

  async function handleDelete(property) {
    Alert.alert("Delete property", `Delete ${property.title} from the system?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProperty(property.id);
            const items = await getProperties({ search, status });
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
      return "Try a different filter or search term.";
    }

    return "No properties are in the catalogue yet.";
  }, [search, status]);

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="All Properties"
        subtitle="Review every listing in the system and manage them as needed."
        userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
        role={(userProfile?.role || "admin").toUpperCase()}
      />

      <View style={styles.searchWrap}>
        <Text style={styles.sectionLabel}>Search</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search all properties"
          placeholderTextColor={COLORS.placeholder}
          style={styles.searchInput}
          autoCapitalize="none"
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

      {loading ? <LoadingSpinner label="Loading all properties..." /> : null}

      {!loading && error ? (
        <EmptyState
          title="We could not load properties"
          description={error}
          actionLabel="Try again"
          onAction={() => setRefreshTick((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && properties.length === 0 ? (
        <EmptyState title="No properties found" description={emptyMessage} />
      ) : null}

      {!loading && !error
        ? properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onView={() => router.push(`/(admin)/properties/${property.id}`)}
              onSecondaryAction={() => handleDelete(property)}
              secondaryActionLabel="Delete"
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
