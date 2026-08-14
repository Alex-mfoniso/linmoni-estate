import React, { useState, useCallback } from "react";
import { ActivityIndicator, StyleSheet, View, Text, Pressable } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { realtorApi } from "../../services/realtorApi";
import DashboardScreen from "../../components/DashboardScreen";
import COLORS from "../../constants/colors";
import { ROLES } from "../../constants/roles";

export default function RealtorDashboard() {
  const { currentUser, userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await realtorApi.getDashboard();
      if (res && res.success) {
        setDashboardData(res.data);
      } else {
        setError("Failed to load dashboard statistics.");
      }
    } catch (err) {
      console.error("Realtor Dashboard fetch error:", err);
      setError(err?.message || "An unexpected error occurred while loading dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [fetchDashboard])
  );

  if (loading && !dashboardData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Assembling your Realtor workspace...</Text>
      </View>
    );
  }

  if (error && !dashboardData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={fetchDashboard}>
          <Text style={styles.retryButtonText}>Retry Loading Workspace</Text>
        </Pressable>
      </View>
    );
  }

  // Fallback structures if empty
  const summary = dashboardData?.summary || {
    activeListings: 0,
    pendingListings: 0,
    upcomingInspections: 0,
    newLeads: 0,
    unreadMessagesCount: 0
  };

  const recentLeads = dashboardData?.recentLeads || [];
  const upcomingInspections = dashboardData?.upcomingInspections || [];
  const recentProperties = dashboardData?.recentProperties || [];

  // 1. Build Stats Grid
  const stats = [
    {
      label: "Properties",
      value: String(summary.activeListings + summary.pendingListings).padStart(2, "0"),
      hint: `${summary.activeListings} Active / ${summary.pendingListings} Pending`
    },
    {
      label: "New Leads",
      value: String(summary.newLeads).padStart(2, "0"),
      hint: "Fresh prospects in pipeline"
    },
    {
      label: "Inspections",
      value: String(summary.upcomingInspections).padStart(2, "0"),
      hint: "Pending or confirmed"
    },
    {
      label: "Unread Chats",
      value: String(summary.unreadMessagesCount).padStart(2, "0"),
      hint: "Awaiting your reply"
    }
  ];

  // 2. Build Schedule Section
  const nextInspection = upcomingInspections[0];
  const scheduleSection = {
    key: "schedule",
    title: "Next Scheduled Inspection",
    subtitle: "Your immediate viewing calendar",
    type: "upcoming",
    item: nextInspection
      ? {
          title: nextInspection.property?.title || "Property Inspection",
          description: `With ${nextInspection.client?.fullName || "Client"}. Msg: ${nextInspection.message || "No message."}`,
          dateLabel: new Date(nextInspection.scheduledAt).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' }),
          timeLabel: new Date(nextInspection.scheduledAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' }),
          badge: nextInspection.status.toUpperCase(),
          actionLabel: "Open Inspections",
          onAction: () => router.push("/(realtor)/bookings")
        }
      : {
          title: "No upcoming inspections",
          description: "Publish your listings or chat with clients to set up viewing appointments.",
          dateLabel: "---",
          timeLabel: "---",
          badge: "IDLE",
          actionLabel: "Add Property",
          onAction: () => router.push("/(realtor)/add-property")
        }
  };

  // 3. Build Leads Section
  const leadsSection = {
    key: "leads",
    title: "Recent Active Leads",
    subtitle: "Opportunities requiring attention",
    type: "timeline",
    items: recentLeads.length > 0
      ? recentLeads.map((lead) => ({
          icon: lead.source?.substring(0, 1).toUpperCase() || "L",
          title: `${lead.client?.fullName || "A Client"} interested in listing`,
          description: `${lead.property?.title || "property"}. Status: ${lead.status.replace("_", " ")}.`,
          createdAt: lead.createdAt
        }))
      : [
          {
            icon: "I",
            title: "Pipeline is clear",
            description: "New interest leads are generated automatically from client saves, inquiries, and booking logs.",
            createdAt: new Date().toISOString()
          }
        ]
  };

  // 4. Build Recent Properties Section
  const propertiesSection = {
    key: "recent-properties",
    title: "Your Portfolio Showcase",
    subtitle: "New and updated listing records",
    type: "horizontal",
    items: recentProperties.length > 0
      ? recentProperties.map((prop) => ({
          title: prop.title,
          description: prop.location || prop.city,
          value: prop.currency + " " + Number(prop.price).toLocaleString(),
          badge: prop.status.toUpperCase(),
          meta: `${prop.bedrooms} bed / ${prop.bathrooms} bath`
        }))
      : [
          {
            title: "No listings on record",
            description: "Get started by adding your first estate property listing.",
            value: "NGN0",
            badge: "DRAFT",
            meta: "---"
          }
        ]
  };

  // 5. Build Quick Actions Grid
  const actionsSection = {
    key: "actions",
    title: "Quick Workspace Operations",
    subtitle: "Common Realtor tasks and management desks",
    type: "grid",
    items: [
      {
        title: "Add Property",
        description: "Submit properties for admin publishing approval.",
        icon: "A",
        route: "/(realtor)/add-property"
      },
      {
        title: "Manage Bookings",
        description: "Review, confirm, or reschedule viewings.",
        icon: "B",
        route: "/(realtor)/bookings"
      },
      {
        title: "Client Messages",
        description: "Unread chats requiring direct response.",
        icon: "M",
        route: "/(realtor)/messages"
      },
      {
        title: "Profile Editor",
        description: "Update your specialties, agency, and bio.",
        icon: "U",
        route: "/(realtor)/profile"
      }
    ]
  };

  return (
    <DashboardScreen
      userName={currentUser?.displayName || userProfile?.fullName || "Realtor"}
      roleLabel={(userProfile?.role || ROLES.REALTOR).toUpperCase()}
      title="Realtor Workspace"
      subtitle="Complete, high-performance real estate pipeline management."
      stats={stats}
      sections={[scheduleSection, leadsSection, propertiesSection, actionsSection]}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    gap: 12
  },
  loadingText: {
    color: COLORS.mutedText,
    fontSize: 14,
    fontWeight: "500"
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    padding: 32,
    gap: 16
  },
  errorText: {
    color: COLORS.text,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24
  },
  retryButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: "900"
  }
});
