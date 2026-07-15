import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ROLES } from "../../constants/roles";
import ProtectedGroup from "../../components/ProtectedGroup";
import RoleBasedTabBar from "../../components/RoleBasedTabBar";

export default function AdminLayout() {
  return (
    <ProtectedGroup role={ROLES.ADMIN}>
      <RoleBasedTabBar
        initialRouteName="dashboard"
        visibleRouteNames={["dashboard", "management", "analytics", "more"]}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="management"
          options={{
            title: "Management",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="layers-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="analytics"
          options={{
            title: "Analytics",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="pie-chart-outline" color={color} size={size} />
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
        <Tabs.Screen name="users" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="properties" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="bookings" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="messages" options={{ tabBarButton: () => null }} />
        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="ellipsis-horizontal-outline" color={color} size={size} />
            ),
          }}
        />
      </RoleBasedTabBar>
    </ProtectedGroup>
  );
}
