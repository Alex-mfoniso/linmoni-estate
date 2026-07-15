import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AuthShell from "../../components/AuthShell";
import FormField from "../../components/FormField";
import PrimaryButton from "../../components/PrimaryButton";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { getDashboardRouteForRole } from "../../utils/authRoutes";

const schema = yup.object({
  fullName: yup
    .string()
    .trim()
    .min(3, "Enter your full name")
    .required("Full name is required"),
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),
  phone: yup
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .required("Phone number is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values) {
    setFormError("");

    try {
      const { profile } = await register(values);
      const destination = getDashboardRouteForRole(profile?.role) ?? "/login";
      router.replace(destination);
    } catch (error) {
      setFormError(error.message || "Unable to create your account right now.");
    }
  }

  return (
    <AuthShell
      title="Create a client account"
      subtitle="Public registration is reserved for clients only."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/login" style={styles.footerLink}>
            Sign in
          </Link>
        </View>
      }
    >
      {formError ? <Text style={styles.errorBanner}>{formError}</Text> : null}

      <Controller
        control={control}
        name="fullName"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Full Name"
            placeholder="John Doe"
            autoCapitalize="words"
            textContentType="name"
            autoComplete="name"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.fullName?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Email Address"
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Phone Number"
            placeholder="+234 800 000 0000"
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.phone?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Password"
            placeholder="Create a password"
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            autoComplete="new-password"
            value={value}
            onBlur={onBlur}
            onChangeText={onChange}
            error={errors.password?.message}
            rightAccessory={
              <Pressable
                onPress={() => setShowPassword((current) => !current)}
                hitSlop={10}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
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
            label="Confirm Password"
            placeholder="Repeat your password"
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
        title="Create Account"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
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
