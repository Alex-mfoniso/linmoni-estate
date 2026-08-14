import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ROLES } from "../../constants/roles";
import ProtectedGroup from "../../components/ProtectedGroup";
import RoleBasedTabBar from "../../components/RoleBasedTabBar";

export default function StakeholderLayout() {
  return (
    <ProtectedGroup role={ROLES.STAKEHOLDER}>
      <RoleBasedTabBar
        initialRouteName="dashboard"
        visibleRouteNames={["dashboard", "analytics", "activity", "profile"]}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Overview",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="business-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: "Analytics",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="analytics-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="activity"
          options={{
            title: "Activity",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen name="properties" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="reports" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="notifications" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="more" options={{ tabBarButton: () => null }} />
      </RoleBasedTabBar>
    </ProtectedGroup>
  );
}
