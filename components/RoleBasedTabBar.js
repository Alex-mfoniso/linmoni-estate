import { useEffect } from "react";
import { Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import COLORS from "../constants/colors";
import MOTION from "../constants/motion";
import useReducedMotion from "../hooks/useReducedMotion";
import { TAB_BAR_SCREEN_OPTIONS } from "../utils/tabBar";

function TabItem({ route, descriptor, navigation, isFocused }) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const options = descriptor?.options || {};
  const label = String(options.tabBarLabel || options.title || route.name);
  const color = isFocused ? COLORS.primary : TAB_BAR_SCREEN_OPTIONS.tabBarInactiveTintColor;

  useEffect(() => {
    scale.value = reduceMotion ? 1 : withSpring(isFocused ? 1.06 : 1, MOTION.spring);
  }, [isFocused, reduceMotion, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  function handlePress() {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });
    if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
  }

  const icon = typeof options.tabBarIcon === "function"
    ? options.tabBarIcon({ focused: isFocused, color, size: 22 })
    : null;
  const badge = options.tabBarBadge;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      onPress={handlePress}
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
    >
      <Animated.View style={[styles.iconWrap, animatedStyle]}>
        {icon}
        {badge ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{Number(badge) > 99 ? "99+" : badge}</Text>
          </View>
        ) : null}
      </Animated.View>
      <Text style={[styles.label, isFocused && styles.labelFocused]} numberOfLines={1}>
        {label}
      </Text>
      <View style={[styles.indicator, isFocused && styles.indicatorFocused]} />
    </Pressable>
  );
}

export default function RoleBasedTabBar({ children, initialRouteName, visibleRouteNames = [] }) {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={TAB_BAR_SCREEN_OPTIONS}
      initialRouteName={initialRouteName}
      tabBar={({ state, descriptors, navigation }) => {
        const visibleRoutes = state.routes.filter((route) =>
          visibleRouteNames.length ? visibleRouteNames.includes(route.name) : true
        );

        return (
          <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
            {visibleRoutes.map((route) => (
              <TabItem
                key={route.key}
                route={route}
                descriptor={descriptors[route.key]}
                navigation={navigation}
                isFocused={state.routes[state.index]?.key === route.key}
              />
            ))}
          </View>
        );
      }}
    >
      {children}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "stretch",
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingTop: 8,
    paddingHorizontal: 8,
    minHeight: 72,
  },
  item: {
    flex: 1,
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingHorizontal: 2,
  },
  itemPressed: { opacity: 0.7 },
  iconWrap: { minHeight: 23, minWidth: 24, alignItems: "center", justifyContent: "center" },
  label: { color: "#7B8885", fontSize: 10, lineHeight: 13, fontWeight: "600" },
  labelFocused: { color: COLORS.primary, fontWeight: "700" },
  indicator: { width: 16, height: 2, borderRadius: 1, backgroundColor: "transparent" },
  indicatorFocused: { backgroundColor: COLORS.secondary },
  badge: {
    position: "absolute",
    top: -4,
    right: -9,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: COLORS.error,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: "800" },
});
