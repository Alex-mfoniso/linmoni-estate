import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View, Alert } from "react-native";
import { useRouter } from "expo-router";
import AppHeader from "../../components/AppHeader";
import BookingCard from "../../components/BookingCard";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { realtorApi } from "../../services/realtorApi";

const STATUS_FILTERS = ["all", "pending", "confirmed", "rescheduled", "rejected", "completed"];

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
        const res = await realtorApi.getBookings({
          search,
          status,
        });

        if (active && res && res.success) {
          setBookings(res.data.items);
        } else if (active) {
          setError("Failed to fetch inspection bookings.");
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
  }, [search, status, refreshTick]);

  async function handleStatusUpdate(booking, nextStatus) {
    try {
      let res;
      if (nextStatus === "confirmed" || nextStatus === "approved") {
        res = await realtorApi.confirmBooking(booking.id);
      } else if (nextStatus === "rejected") {
        res = await realtorApi.rejectBooking(booking.id);
      } else if (nextStatus === "completed") {
        res = await realtorApi.completeBooking(booking.id);
      }

      if (res && res.success) {
        setRefreshTick((value) => value + 1);
      } else {
        Alert.alert("Action Failed", "Could not complete this booking transition.");
      }
    } catch (err) {
      Alert.alert("Error", err?.message || "Unable to update booking status.");
    }
  }

  async function handleReschedule(booking) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    Alert.alert(
      "Reschedule Viewing",
      "Propose an audited reschedule slot:",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Tomorrow (+24h)",
          onPress: async () => {
            try {
              const res = await realtorApi.rescheduleBooking(booking.id, tomorrow);
              if (res && res.success) {
                setRefreshTick((v) => v + 1);
              }
            } catch (err) {
              Alert.alert("Reschedule Failed", err?.message || "Could not save reschedule.");
            }
          }
        },
        {
          text: "Next Week (+7d)",
          onPress: async () => {
            try {
              const res = await realtorApi.rescheduleBooking(booking.id, nextWeek);
              if (res && res.success) {
                setRefreshTick((v) => v + 1);
              }
            } catch (err) {
              Alert.alert("Reschedule Failed", err?.message || "Could not save reschedule.");
            }
          }
        }
      ]
    );
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
        title="Inspections Desk"
        subtitle="Approve, reschedule, or complete viewing visits."
        userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
        role={(userProfile?.role || "realtor").toUpperCase()}
      />

      <View style={styles.toolbar}>
        <View style={styles.searchWrap}>
          <Text style={styles.sectionLabel}>Search</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search client names or properties"
            placeholderTextColor={COLORS.placeholder}
            style={styles.searchInput}
            autoCapitalize="none"
          />
        </View>

        <PrimaryButton
          title="Return to properties"
          variant="ghost"
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

      {loading ? <LoadingSpinner label="Querying inspection schedules..." /> : null}

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
        ? bookings.map((booking) => {
            // Unify status matching
            const isPending = booking.status === "pending" || booking.status === "requested";
            const isConfirmed = booking.status === "confirmed" || booking.status === "approved";

            return (
              <BookingCard
                key={booking.id}
                booking={booking}
                onViewProperty={() =>
                  router.push(`/(realtor)/properties/${booking.propertyId}`)
                }
                onPrimaryAction={
                  isPending
                    ? () => handleStatusUpdate(booking, "confirmed")
                    : isConfirmed
                      ? () => handleStatusUpdate(booking, "completed")
                      : null
                }
                primaryActionLabel={
                  isPending
                    ? "Approve"
                    : isConfirmed
                      ? "Complete Visit"
                      : undefined
                }
                onSecondaryAction={
                  isPending
                    ? () => handleStatusUpdate(booking, "rejected")
                    : isConfirmed
                      ? () => handleReschedule(booking)
                      : null
                }
                secondaryActionLabel={
                  isPending
                    ? "Reject"
                    : isConfirmed
                      ? "Reschedule"
                      : undefined
                }
              />
            );
          })
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
