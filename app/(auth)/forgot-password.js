import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import AuthShell from "../../components/AuthShell";
import FormField from "../../components/FormField";
import PrimaryButton from "../../components/PrimaryButton";
import COLORS from "../../constants/colors";
import { useAuth } from "../../contexts/AuthContext";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";

const schema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),
});

export default function ForgotPasswordScreen() {
  const { forgotPassword } = useAuth();
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values) {
    setFormError("");
    setSuccessMessage("");

    try {
      await forgotPassword(values.email);
      setSuccessMessage("If the account exists, a password reset email was sent.");
    } catch (error) {
      setFormError(getFriendlyErrorMessage(error, "Unable to request a reset right now."));
    }
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="We'll send a secure link to your inbox."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Remember your password?</Text>
          <Link href="/login" style={styles.footerLink}>
            Sign in
          </Link>
        </View>
      }
    >
      {formError ? <Text style={styles.errorBanner}>{formError}</Text> : null}
      {successMessage ? <Text style={styles.successBanner}>{successMessage}</Text> : null}

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

      <PrimaryButton
        title="Send reset link"
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
  successBanner: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(34, 139, 91, 0.1)",
    color: COLORS.success,
    fontSize: 13,
    fontWeight: "700",
  },
});
