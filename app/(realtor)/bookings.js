import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "../../components/AppHeader";
import BookingCard from "../../components/BookingCard";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { getBookings, updateBooking } from "../../services/bookingService";

const STATUS_FILTERS = ["all", "pending", "approved", "rejected", "completed"];

export default function RealtorBookingsScreen() {
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
          realtorId: currentUser?.uid,
        });

        if (active) {
          setBookings(items);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Could not load booking requests.");
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

  async function handleStatusUpdate(booking, nextStatus) {
    try {
      await updateBooking(booking.id, { status: nextStatus });
      const items = await getBookings({
        search,
        status,
        realtorId: currentUser?.uid,
      });
      setError("");
      setBookings(items);
    } catch (err) {
      setError(err?.message || "Unable to update this booking.");
    }
  }

  const emptyMessage = useMemo(() => {
    if (search || status !== "all") {
      return "Try a different search term or booking status.";
    }

    return "Inspection requests for your listings will appear here.";
  }, [search, status]);

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title="Bookings"
        subtitle="Review inspection requests for your properties."
        userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
        role={(userProfile?.role || "realtor").toUpperCase()}
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
          title="My properties"
          onPress={() => router.push("/(realtor)/properties")}
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

      {loading ? <LoadingSpinner label="Loading bookings..." /> : null}

      {!loading && error ? (
        <EmptyState
          title="We could not load bookings"
          description={error}
          actionLabel="Try again"
          onAction={() => setRefreshTick((value) => value + 1)}
        />
      ) : null}

      {!loading && !error && bookings.length === 0 ? (
        <EmptyState title="No bookings found" description={emptyMessage} />
      ) : null}

      {!loading && !error
        ? bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onViewProperty={() =>
                router.push(`/(realtor)/properties/${booking.propertyId}`)
              }
              onPrimaryAction={
                booking.status === "pending"
                  ? () => handleStatusUpdate(booking, "approved")
                  : booking.status === "approved"
                    ? () => handleStatusUpdate(booking, "completed")
                    : null
              }
              primaryActionLabel={
                booking.status === "pending"
                  ? "Approve"
                  : booking.status === "approved"
                    ? "Complete"
                    : undefined
              }
              onSecondaryAction={
                booking.status === "pending"
                  ? () => handleStatusUpdate(booking, "rejected")
                  : null
              }
              secondaryActionLabel="Reject"
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
