import { StyleSheet, View } from "react-native";
import QuickActionCard from "./QuickActionCard";
import RevealView from "./RevealView";

export default function QuickActionGrid({ items = [] }) {
  return (
    <View style={styles.grid}>
      {items.map((item, index) => (
        <RevealView key={item.title} delay={index * 55} style={styles.cell}>
          <QuickActionCard {...item} />
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
