import { StyleSheet, View } from "react-native";
import SectionHeader from "./SectionHeader";

export default function DashboardSection({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}) {
  return (
    <View style={styles.section}>
      <SectionHeader
        title={title}
        subtitle={subtitle}
        actionLabel={actionLabel}
        onAction={onAction}
      />
      <View style={styles.body}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  body: {
    gap: 12,
  },
});
