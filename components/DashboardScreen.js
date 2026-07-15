import { View, StyleSheet } from "react-native";
import ScreenContainer from "./ScreenContainer";
import DashboardHeader from "./DashboardHeader";
import DashboardStatsGrid from "./DashboardStatsGrid";
import DashboardSection from "./DashboardSection";
import QuickActionGrid from "./QuickActionGrid";
import ActivityTimeline from "./ActivityTimeline";
import HorizontalCardList from "./HorizontalCardList";
import InsightCard from "./InsightCard";
import RecentItemsList from "./RecentItemsList";
import UpcomingCard from "./UpcomingCard";
import EmptyDashboard from "./EmptyDashboard";

function renderSection(section) {
  switch (section.type) {
    case "timeline":
      return <ActivityTimeline items={section.items} />;
    case "grid":
      return <QuickActionGrid items={section.items} />;
    case "horizontal":
      return (
        <HorizontalCardList
          items={section.items}
          renderItem={(item) => <InsightCard {...item} />}
        />
      );
    case "list":
      return <RecentItemsList items={section.items} />;
    case "upcoming":
      return <UpcomingCard {...section.item} />;
    case "insight":
      return <InsightCard {...section.item} />;
    case "empty":
      return <EmptyDashboard title={section.title} description={section.description} />;
    default:
      return <View />;
  }
}

export default function DashboardScreen({
  userName,
  roleLabel,
  title,
  subtitle,
  stats = [],
  sections = [],
}) {
  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <DashboardHeader
        title={title}
        subtitle={subtitle}
        userName={userName}
        roleLabel={roleLabel}
      />

      <DashboardStatsGrid stats={stats} />

      <View style={styles.sections}>
        {sections.map((section) => (
          <DashboardSection
            key={section.key || section.title}
            title={section.title}
            subtitle={section.subtitle}
            actionLabel={section.actionLabel}
            onAction={section.onAction}
          >
            {renderSection(section)}
          </DashboardSection>
        ))}
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
  sections: {
    gap: 20,
  },
});
