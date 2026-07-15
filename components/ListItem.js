import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";

export default function ListItem({
  title,
  description,
  icon = "chevron-forward",
  onPress,
  danger = false,
  rightAccessory,
}) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.item,
          pressed ? styles.pressed : null,
          danger ? styles.danger : null,
        ]}
      >
        <View style={styles.leading}>
          <View style={[styles.iconWrap, danger ? styles.iconWrapDanger : null]}>
            <Ionicons
              name={icon}
              size={18}
              color={danger ? COLORS.error : COLORS.primary}
            />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.title, danger ? styles.titleDanger : null]}>
              {title}
            </Text>
            {description ? <Text style={styles.description}>{description}</Text> : null}
          </View>
        </View>
        <View style={styles.trailing}>
          {rightAccessory ? rightAccessory : null}
          <Ionicons
            name="chevron-forward"
            size={16}
            color={danger ? COLORS.error : COLORS.mutedText}
          />
        </View>
      </Pressable>
    );
  }

  return (
    <View style={[styles.item, danger ? styles.danger : null]}>
      <View style={styles.leading}>
        <View style={[styles.iconWrap, danger ? styles.iconWrapDanger : null]}>
          <Ionicons
            name={icon}
            size={18}
            color={danger ? COLORS.error : COLORS.primary}
          />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, danger ? styles.titleDanger : null]}>
            {title}
          </Text>
          {description ? <Text style={styles.description}>{description}</Text> : null}
        </View>
      </View>
      <View style={styles.trailing}>{rightAccessory ? rightAccessory : null}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  danger: {
    borderColor: "rgba(214, 69, 69, 0.18)",
    backgroundColor: "rgba(214, 69, 69, 0.05)",
  },
  leading: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.softPrimary,
  },
  iconWrapDanger: {
    backgroundColor: "rgba(214, 69, 69, 0.12)",
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: "800",
  },
  titleDanger: {
    color: COLORS.error,
  },
  description: {
    color: COLORS.mutedText,
    fontSize: 13,
    lineHeight: 18,
  },
  trailing: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
});
