import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "../../components/AppHeader";
import BookingCard from "../../components/BookingCard";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { deleteBooking, getBookings } from "../../services/bookingService";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected", "completed"];

export default function ClientBookingsScreen() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadBookings() {
      setLoading(true);
      setError("");

      try {
        const items = await getBookings({
          search,
          status,
          clientId: currentUser?.uid,
        });

        if (active) {
          setBookings(items);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load your bookings.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadBookings();

    return () => {
      active = false;
    };
  }, [currentUser?.uid, search, status, refreshTick]);

  function handleCancel(booking) {
    Alert.alert("Cancel booking", "Remove this pending booking request?", [
      { text: "Keep it", style: "cancel" },
      {
        text: "Cancel booking",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteBooking(booking.id);
            const items = await getBookings({
              search,
              status,
              clientId: currentUser?.uid,
            });
            setError("");
            setBookings(items);
          } catch (err) {
            setError(err?.message || "Unable to cancel this booking.");
          }
        },
      },
    ]);
  }

  const emptyMessage = useMemo(() => {
    if (search || status !== "all") {
      return "Try a different search term or booking status.";
    }

    return "Your inspection requests will appear here.";
  }, [search, status]);

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="My Bookings"
        subtitle="Track your inspection requests and manage any pending ones."
        userName={currentUser?.displayName || userProfile?.fullName || "Client"}
        role={(userProfile?.role || "client").toUpperCase()}
      />

      <View style={styles.toolbar}>
        <View style={styles.searchWrap}>
          <Text style={styles.sectionLabel}>Search</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search bookings"
            placeholderTextColor={COLORS.placeholder}
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>

        <PrimaryButton
          title="Browse properties"
          onPress={() => router.push("/(client)/properties")}
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

      {loading ? <LoadingSpinner label="Loading your bookings..." /> : null}

      {!loading && error ? (
        <EmptyState
          title="We could not load bookings"
          description={error}
          actionLabel="Try again"
          onAction={() => setRefreshTick((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && bookings.length === 0 ? (
        <EmptyState
          title="No bookings yet"
          description={emptyMessage}
          actionLabel="Browse properties"
          onAction={() => router.push("/(client)/properties")}
        />
      ) : null}

      {!loading && !error
        ? bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewProperty={() =>
                router.push(`/(client)/properties/${booking.propertyId}`)
              }
              onPrimaryAction={
                booking.status === "pending" ? () => handleCancel(booking) : null
              }
              primaryActionLabel="Cancel"
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
