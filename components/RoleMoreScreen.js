import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import AppHeader from "./AppHeader";
import ListItem from "./ListItem";
import ScreenContainer from "./ScreenContainer";
import COLORS from "../constants/colors";

export default function RoleMoreScreen({
  title,
  subtitle,
  userName,
  role,
  notificationCount = 0,
  onNotificationPress,
  sections = [],
}) {
  const router = useRouter();

  return (
    <ScreenContainer contentContainerStyle={styles.container}>
      <AppHeader
        title={title}
        subtitle={subtitle}
        userName={userName}
        role={role}
        notificationCount={notificationCount}
        onNotificationPress={onNotificationPress}
      />

      <View style={styles.profileCard}>
        <Text style={styles.profileLabel}>Account</Text>
        <Text style={styles.profileTitle}>{userName}</Text>
        <Text style={styles.profileSubtitle}>{String(role || "").toUpperCase()}</Text>
      </View>

      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <View style={styles.list}>
            {section.items.map((item) => (
              <ListItem
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
                danger={item.danger}
                onPress={
                  item.onPress ||
                  (item.route ? () => router.push(item.route) : undefined)
                }
              />
            ))}
          </View>
        </View>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 16,
  },
  profileCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    padding: 18,
    gap: 4,
  },
  profileLabel: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  profileTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "900",
  },
  profileSubtitle: {
    color: COLORS.mutedText,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  list: {
    gap: 10,
  },
});
