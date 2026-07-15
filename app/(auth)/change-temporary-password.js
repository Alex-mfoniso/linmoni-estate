import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import AuthShell from "../../components/AuthShell";
import FormField from "../../components/FormField";
import PrimaryButton from "../../components/PrimaryButton";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { changePassword } from "../../services/authService";
import { AUTH_ROUTES, getPostLoginRoute } from "../../utils/authRoutes";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";

const schema = yup.object({
  currentPassword: yup.string().required("Temporary password is required"),
  newPassword: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("New password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords must match")
    .required("Confirm your new password"),
});

export default function ChangeTemporaryPasswordScreen() {
  const router = useRouter();
  const { currentUser, userProfile, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values) {
    if (!currentUser?.uid) {
      setFormError("No authenticated user was found.");
      return;
    }

    setLoading(true);
    setFormError("");

    try {
      await changePassword(currentUser.uid, values.currentPassword, values.newPassword);
      const refreshed = await refreshUser();
      const destination = getPostLoginRoute(refreshed?.profile || userProfile);
      router.replace(destination || AUTH_ROUTES.LOGIN);
    } catch (err) {
      setFormError(getFriendlyErrorMessage(err, "Unable to change your password."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Change temporary password"
      subtitle="Set a new password to unlock your account."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Need help signing in?</Text>
          <Link href={AUTH_ROUTES.LOGIN} style={styles.footerLink}>
            Return to login
          </Link>
        </View>
      }
    >
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Account</Text>
        <Text style={styles.infoValue}>{userProfile?.fullName || currentUser?.displayName || "User"}</Text>
        <Text style={styles.infoLabel}>Role</Text>
        <Text style={styles.infoValue}>{String(userProfile?.role || "-").toUpperCase()}</Text>
      </View>

      {formError ? <Text style={styles.errorBanner}>{formError}</Text> : null}

      <Controller
        control={control}
        name="currentPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Temporary Password"
            placeholder="Enter your current temporary password"
            secureTextEntry={!showCurrentPassword}
            textContentType="password"
            autoComplete="password"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.currentPassword?.message}
            rightAccessory={
              <Pressable
                onPress={() => setShowCurrentPassword((current) => !current)}
                hitSlop={10}
              >
                <Ionicons
                  name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={COLORS.mutedText}
                />
              </Pressable>
            }
          />
        )}
      />

      <Controller
        control={control}
        name="newPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="New Password"
            placeholder="Create a new password"
            secureTextEntry={!showNewPassword}
            textContentType="newPassword"
            autoComplete="new-password"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.newPassword?.message}
            rightAccessory={
              <Pressable
                onPress={() => setShowNewPassword((current) => !current)}
                hitSlop={10}
              >
                <Ionicons
                  name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={COLORS.mutedText}
                />
              </Pressable>
            }
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Confirm New Password"
            placeholder="Repeat your new password"
            secureTextEntry={!showConfirmPassword}
            textContentType="newPassword"
            autoComplete="new-password"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.confirmPassword?.message}
            rightAccessory={
              <Pressable
                onPress={() => setShowConfirmPassword((current) => !current)}
                hitSlop={10}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={COLORS.mutedText}
                />
              </Pressable>
            }
          />
        )}
      />

      <PrimaryButton
        title="Update password"
        onPress={handleSubmit(onSubmit)}
        loading={loading}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  footerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.mutedText,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.primary,
  },
  infoCard: {
    gap: 4,
    borderRadius: 18,
    padding: 16,
    backgroundColor: COLORS.softPrimary,
    borderWidth: 1,
    borderColor: "rgba(15, 76, 92, 0.08)",
    marginBottom: 4,
  },
  infoLabel: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  infoValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  errorBanner: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(214, 69, 69, 0.08)",
    color: COLORS.error,
    fontSize: 13,
    fontWeight: "700",
  },
});
