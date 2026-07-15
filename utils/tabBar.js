import COLORS from "../constants/colors";

export const TAB_BAR_SCREEN_OPTIONS = {
  headerShown: false,
  tabBarActiveTintColor: COLORS.primary,
  tabBarInactiveTintColor: "#8A99A8",
  tabBarLabelStyle: {
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 1,
  },
  tabBarStyle: {
    borderTopColor: "rgba(217, 226, 236, 0.95)",
    backgroundColor: COLORS.surface,
    height: 70,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 10,
  },
  tabBarItemStyle: {
    paddingVertical: 6,
  },
  tabBarBadgeStyle: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
    fontWeight: "800",
  },
  tabBarHideOnKeyboard: true,
};
