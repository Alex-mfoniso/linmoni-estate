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
import { getPostLoginRoute } from "../../utils/authRoutes";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";

const schema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values) {
    setFormError("");

    try {
      const { profile } = await login(values);
      const destination = getPostLoginRoute(profile);
      router.replace(destination);
    } catch (error) {
      setFormError(getFriendlyErrorMessage(error, "Unable to sign in right now."));
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to access your LINPAL Premium Estates workspace."
      footer={
        <View style={styles.footerRow}>
          <Text style={styles.footerText}>Need a client account?</Text>
          <Link href="/register" style={styles.footerLink}>
            Register
          </Link>
        </View>
      }
    >
      {formError ? <Text style={styles.errorBanner}>{formError}</Text> : null}

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
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <FormField
            label="Password"
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            textContentType="password"
            autoComplete="password"
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

      <PrimaryButton
        title="Sign In"
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
      />

      <Link href="/forgot-password" style={styles.forgotLink}>
        Forgot your password?
      </Link>
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
  forgotLink: {
    marginTop: 8,
    alignSelf: "center",
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.secondary,
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
