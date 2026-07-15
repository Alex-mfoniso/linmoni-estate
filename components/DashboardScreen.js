import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import ScreenContainer from "./ScreenContainer";
import AppHeader from "./AppHeader";
import StatCard from "./StatCard";
import DashboardCard from "./DashboardCard";
import EmptyState from "./EmptyState";
import SectionHeader from "./SectionHeader";

export default function DashboardScreen({
  userName,
  roleLabel,
  title,
  subtitle,
  notificationCount = 0,
  onNotificationPress,
  stats = [],
  cards = [],
}) {
  const router = useRouter();

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title={title}
        subtitle={subtitle}
        userName={userName}
        role={roleLabel}
        notificationCount={notificationCount}
        onNotificationPress={onNotificationPress}
      />

      <SectionHeader title="Overview" subtitle="A quick read on your account." />

      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </View>

      <SectionHeader title="Quick actions" subtitle="Jump straight into the most useful areas." />

      <View style={styles.cardsGrid}>
        {cards.length > 0 ? (
          cards.map((item) => (
            <DashboardCard
              key={item.title}
              {...item}
              onPress={
                item.onPress ||
                (item.route ? () => router.push(item.route) : undefined)
              }
            />
          ))
        ) : (
          <EmptyState
            title="Nothing to show yet"
            description="This area will fill in as new features are added."
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 16,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cardsGrid: {
    gap: 12,
  },
});
