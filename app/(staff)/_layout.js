import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ROLES } from "../../constants/roles";
import ProtectedGroup from "../../components/ProtectedGroup";
import RoleBasedTabBar from "../../components/RoleBasedTabBar";
import { useAuth } from "../../contexts/AuthContext";
import useUnreadMessageCount from "../../hooks/useUnreadMessageCount";

export default function StaffLayout() {
  const { currentUser } = useAuth();
  const unreadMessages = useUnreadMessageCount(currentUser?.uid);

  return (
    <ProtectedGroup role={ROLES.STAFF}>
      <RoleBasedTabBar
        initialRouteName="dashboard"
        visibleRouteNames={["dashboard", "tasks", "messages", "profile"]}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="grid-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: "Tasks",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="checkbox-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: "Messages",
            tabBarBadge: unreadMessages > 0 ? unreadMessages : undefined,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles-outline" color={color} size={size} />
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
        {/* Secondary hidden routes */}
        <Tabs.Screen name="properties" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="bookings" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="issues" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="more" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="notifications" options={{ tabBarButton: () => null }} />
      </RoleBasedTabBar>
    </ProtectedGroup>
  );
}
