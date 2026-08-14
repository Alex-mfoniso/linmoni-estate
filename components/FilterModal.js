import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import COLORS from "../constants/colors";
import AppInput from "./AppInput";
import PrimaryButton from "./PrimaryButton";

const STATUS_OPTIONS = ["all", "available", "rented", "sold", "draft"];

export default function FilterModal({
  visible,
  value,
  onClose,
  onApply,
  onReset,
  propertyTypes = [],
  showStatus = true,
}) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) {
      setDraft(value);
    }
  }, [value, visible]);

  function updateField(field, nextValue) {
    setDraft((current) => ({
      ...current,
      [field]: nextValue,
    }));
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <Pressable onPress={onClose} style={styles.iconButton}>
              <Ionicons name="close" size={18} color={COLORS.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <AppInput
                label="Min price"
                value={String(draft.minPrice || "")}
                onChangeText={(nextValue) => updateField("minPrice", nextValue)}
                placeholder="e.g. 25000000"
                keyboardType="numeric"
              />
              <AppInput
                label="Max price"
                value={String(draft.maxPrice || "")}
                onChangeText={(nextValue) => updateField("maxPrice", nextValue)}
                placeholder="e.g. 120000000"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Bedrooms</Text>
              <TextInput
                value={String(draft.bedrooms || "")}
                onChangeText={(nextValue) => updateField("bedrooms", nextValue)}
                placeholder="Any"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Bathrooms</Text>
              <TextInput
                value={String(draft.bathrooms || "")}
                onChangeText={(nextValue) => updateField("bathrooms", nextValue)}
                placeholder="Any"
                placeholderTextColor={COLORS.placeholder}
                keyboardType="numeric"
                style={styles.input}
              />
            </View>

            {showStatus ? <View style={styles.section}>
              <Text style={styles.sectionLabel}>Status</Text>
              <View style={styles.chipRow}>
                {STATUS_OPTIONS.map((option) => {
                  const active = draft.status === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => updateField("status", option)}
                      style={[styles.chip, active ? styles.chipActive : null]}
                    >
                      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View> : null}

            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Property type</Text>
              <View style={styles.chipRow}>
                <Pressable
                  onPress={() => updateField("propertyType", "all")}
                  style={[
                    styles.chip,
                    draft.propertyType === "all" ? styles.chipActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      draft.propertyType === "all" ? styles.chipTextActive : null,
                    ]}
                  >
                    all
                  </Text>
                </Pressable>
                {propertyTypes.map((type) => {
                  const active = draft.propertyType === type;
                  return (
                    <Pressable
                      key={type}
                      onPress={() => updateField("propertyType", type)}
                      style={[styles.chip, active ? styles.chipActive : null]}
                    >
                      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>
                        {type}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.actions}>
              <PrimaryButton
                title="Reset filters"
                variant="ghost"
                onPress={onReset}
                containerStyle={styles.actionButton}
              />
              <PrimaryButton
                title="Apply filters"
                onPress={() => onApply(draft)}
                containerStyle={styles.actionButton}
              />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(10, 17, 20, 0.38)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "88%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: COLORS.background,
    paddingHorizontal: 18,
    paddingBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: COLORS.border,
    marginTop: 10,
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  content: {
    gap: 16,
    paddingBottom: 4,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 18,
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 16,
    color: COLORS.text,
    fontSize: 15,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.mutedText,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  chipTextActive: {
    color: COLORS.white,
  },
  actions: {
    gap: 10,
    paddingTop: 4,
  },
  actionButton: {
    width: "100%",
  },
});
