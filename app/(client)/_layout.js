import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ROLES } from "../../constants/roles";
import ProtectedGroup from "../../components/ProtectedGroup";
import RoleBasedTabBar from "../../components/RoleBasedTabBar";
import useClientUnreadMessageCount from "../../hooks/useClientUnreadMessageCount";

export default function ClientLayout() {
  const unreadMessages = useClientUnreadMessageCount();

  return (
    <ProtectedGroup role={ROLES.CLIENT}>
      <RoleBasedTabBar
        initialRouteName="dashboard"
        visibleRouteNames={["dashboard", "properties", "messages", "profile"]}
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
          name="properties"
          options={{
            title: "Properties",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="business-outline" color={color} size={size} />
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
        <Tabs.Screen name="saved" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="bookings" options={{ tabBarButton: () => null }} />
        <Tabs.Screen
          name="more"
          options={{ tabBarButton: () => null }}
        />
      </RoleBasedTabBar>
    </ProtectedGroup>
  );
}
