import { ScrollView, StyleSheet, View } from "react-native";
import RevealView from "./RevealView";

export default function HorizontalCardList({ items = [], renderItem }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {items.map((item, index) => (
        <RevealView key={`${item.title}-${index}`} delay={index * 50} style={styles.item}>
          {renderItem ? renderItem(item, index) : null}
        </RevealView>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    paddingRight: 4,
  },
  item: {
    width: 220,
  },
});
