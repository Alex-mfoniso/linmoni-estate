import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ROLES } from "../../constants/roles";
import ProtectedGroup from "../../components/ProtectedGroup";
import RoleBasedTabBar from "../../components/RoleBasedTabBar";
import { useAuth } from "../../contexts/AuthContext";
import useUnreadMessageCount from "../../hooks/useUnreadMessageCount";

export default function RealtorLayout() {
  const { currentUser } = useAuth();
  const unreadMessages = useUnreadMessageCount(currentUser?.uid);

  return (
    <ProtectedGroup role={ROLES.REALTOR}>
      <RoleBasedTabBar
        initialRouteName="dashboard"
        visibleRouteNames={["dashboard", "properties", "messages", "more"]}
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
        <Tabs.Screen name="add-property" options={{ tabBarButton: () => null }} />
        <Tabs.Screen name="bookings" options={{ tabBarButton: () => null }} />
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
