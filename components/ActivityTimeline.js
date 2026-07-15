import { View, StyleSheet } from "react-native";
import ActivityCard from "./ActivityCard";
import RevealView from "./RevealView";

export default function ActivityTimeline({ items = [] }) {
  return (
    <View style={styles.list}>
      {items.map((item, index) => (
        <RevealView key={`${item.title}-${index}`} delay={index * 55}>
          <ActivityCard {...item} />
        </RevealView>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
});
