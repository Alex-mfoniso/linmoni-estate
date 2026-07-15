import { Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import COLORS from "../constants/colors";
import { TAB_BAR_SCREEN_OPTIONS } from "../utils/tabBar";

export default function RoleBasedTabBar({
  children,
  initialRouteName,
  visibleRouteNames = [],
}) {
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
          <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
            {visibleRoutes.map((route) => {
              const descriptor = descriptors[route.key];
              const options = descriptor?.options || {};
              const isFocused = state.routes[state.index]?.key === route.key;
              const icon =
                typeof options.tabBarIcon === "function"
                  ? options.tabBarIcon({
                      focused: isFocused,
                      color: isFocused
                        ? COLORS.primary
                        : TAB_BAR_SCREEN_OPTIONS.tabBarInactiveTintColor,
                      size: 22,
                    })
                  : null;

              const badge = options.tabBarBadge;

              function handlePress() {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }

              return (
                <Pressable
                  key={route.key}
                  onPress={handlePress}
                  style={({ pressed }) => [
                    styles.item,
                    isFocused && styles.itemFocused,
                    pressed && styles.itemPressed,
                  ]}
                >
                  <View style={styles.iconWrap}>
                    {icon}
                    {badge ? (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {Number(badge) > 99 ? "99+" : Number(badge)}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
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
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(217, 226, 236, 0.95)",
    backgroundColor: COLORS.surface,
    paddingTop: 8,
    paddingHorizontal: 10,
    minHeight: 70,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderRadius: 18,
    paddingVertical: 6,
  },
  itemFocused: {},
  itemPressed: {
    opacity: 0.85,
  },
  iconWrap: {
    minHeight: 24,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: "900",
  },
});
