import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppHeader from "../../components/AppHeader";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import PropertyCard from "../../components/PropertyCard";
import ScreenContainer from "../../components/ScreenContainer";
import SectionHeader from "../../components/SectionHeader";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { clientHomeApi } from "../../services/clientHomeApi";

const ACTIONS = [
  { title: "Saved", icon: "heart-outline", route: "/(client)/saved" },
  { title: "Bookings", icon: "calendar-outline", route: "/(client)/bookings" },
  { title: "Messages", icon: "chatbubbles-outline", route: "/(client)/messages" },
  { title: "Alerts", icon: "notifications-outline", route: "/(client)/notifications" },
];

export default function ClientDashboard() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load(refresh = false) {
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      setData(await clientHomeApi.get());
    } catch (err) {
      setError(err?.message || "Could not load your home feed.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader title={`Welcome, ${(data?.user?.fullName || currentUser?.displayName || userProfile?.fullName || "Client").split(" ")[0]}`} subtitle="Premium properties, inspections, and conversations in one place." userName={data?.user?.fullName || "Client"} role="CLIENT" />
      {loading ? <LoadingSpinner label="Preparing your home..." /> : null}
      {!loading && error ? <EmptyState title="Home is unavailable" description={error} actionLabel="Try again" onAction={() => load()} /> : null}
      {!loading && data ? (
        <>
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>YOUR PROPERTY JOURNEY</Text>
            <Text style={styles.heroTitle}>Find a place worth coming home to.</Text>
            <Text style={styles.heroText}>{data.favouriteCount} saved · {data.unreadMessageCount} unread messages · {data.unreadNotificationCount} new alerts</Text>
            <Pressable style={styles.heroButton} onPress={() => router.push("/(client)/properties")} accessibilityRole="button"><Text style={styles.heroButtonText}>Explore properties</Text><Ionicons name="arrow-forward" size={17} color={COLORS.primary} /></Pressable>
          </View>

          <View style={styles.actionGrid}>
            {ACTIONS.map((action) => (
              <Pressable key={action.title} style={styles.action} onPress={() => router.push(action.route)} accessibilityRole="button">
                <Ionicons name={action.icon} size={21} color={COLORS.primary} />
                <Text style={styles.actionText}>{action.title}</Text>
              </Pressable>
            ))}
          </View>

          {data.upcomingBooking ? (
            <Pressable style={styles.updateCard} onPress={() => router.push("/(client)/bookings")}>
              <Ionicons name="calendar" size={22} color={COLORS.secondary} />
              <View style={styles.updateCopy}><Text style={styles.updateTitle}>Upcoming inspection</Text><Text style={styles.updateText}>{data.upcomingBooking.property?.title} · {new Date(data.upcomingBooking.scheduledAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</Text></View>
            </Pressable>
          ) : null}

          <SectionHeader title="Featured estates" subtitle="Curated opportunities from the LINPAL catalogue." actionLabel="See all" onAction={() => router.push("/(client)/properties")} />
          <FlatList horizontal data={data.featuredProperties} keyExtractor={(item) => item.id} renderItem={({ item }) => <View style={styles.propertyWrap}><PropertyCard property={item} onView={() => router.push(`/(client)/properties/${item.id}`)} /></View>} ItemSeparatorComponent={() => <View style={styles.horizontalGap} />} showsHorizontalScrollIndicator={false} />

          <SectionHeader title="Recently added" subtitle="Fresh listings ready to explore." />
          {data.recentProperties.map((item) => <PropertyCard key={item.id} property={item} onView={() => router.push(`/(client)/properties/${item.id}`)} />)}
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32, gap: 16 },
  hero: { borderRadius: 28, padding: 22, gap: 10, backgroundColor: COLORS.primary },
  eyebrow: { color: COLORS.secondary, fontSize: 11, fontWeight: "900", letterSpacing: 1 },
  heroTitle: { color: COLORS.white, fontSize: 29, lineHeight: 35, fontWeight: "900", maxWidth: 470 },
  heroText: { color: "rgba(255,255,255,0.78)", fontSize: 13, lineHeight: 19 },
  heroButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6, borderRadius: 16, paddingHorizontal: 15, paddingVertical: 12, backgroundColor: COLORS.white },
  heroButtonText: { color: COLORS.primary, fontWeight: "900" },
  actionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  action: { flexBasis: "47%", flexGrow: 1, minHeight: 72, borderRadius: 20, padding: 15, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  actionText: { color: COLORS.text, fontSize: 14, fontWeight: "900" },
  updateCard: { borderRadius: 22, padding: 17, flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: COLORS.warningSurface, borderWidth: 1, borderColor: COLORS.border },
  updateCopy: { flex: 1, gap: 3 },
  updateTitle: { color: COLORS.text, fontSize: 14, fontWeight: "900" },
  updateText: { color: COLORS.mutedText, fontSize: 12, lineHeight: 17 },
  propertyWrap: { width: 320 },
  horizontalGap: { width: 12 },
});
