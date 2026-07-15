import { StyleSheet, View } from "react-native";
import StatCard from "./StatCard";
import RevealView from "./RevealView";

export default function DashboardStatsGrid({ stats = [] }) {
  return (
    <View style={styles.grid}>
      {stats.map((item, index) => (
        <RevealView key={item.label} delay={index * 55} style={styles.cell}>
          <StatCard {...item} />
        </RevealView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cell: {
    flexBasis: "48%",
    flexGrow: 1,
  },
});
