import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import AuthShell from "../../components/AuthShell";
import EmptyState from "../../components/EmptyState";
import FormField from "../../components/FormField";
import LoadingSpinner from "../../components/LoadingSpinner";
import PrimaryButton from "../../components/PrimaryButton";
import COLORS from "../../constants/colors";
import { AUTH_ROUTES, getPostLoginRoute } from "../../utils/authRoutes";
import { getFriendlyErrorMessage } from "../../utils/errorMessages";
import { useAuth } from "../../contexts/AuthContext";
import {
  acceptInvitationRequest,
  validateInvitationRequestToken,
} from "../../services/adminApiService";

const schema = yup.object({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

export default function AcceptInvitationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const token = String(params.token || "");
  const { login } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState("");
  const [validationError, setValidationError] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    let active = true;

    async function loadInvitation() {
      if (!token) {
        setValidationError("The invitation token is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setValidationError("");

      try {
        const result = await validateInvitationRequestToken(token);

        if (!active) {
          return;
        }

        if (!result.valid) {
          setValidationError(
            result.reason === "expired"
              ? "This invitation has expired."
              : result.reason === "revoked"
              ? "This invitation has been revoked."
              : "This invitation link is invalid."
          );
          setInvitation(null);
          return;
        }

        setInvitation(result.invitation);
      } catch (err) {
        if (active) {
          setValidationError(
            getFriendlyErrorMessage(err, "Could not load this invitation.")
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInvitation();

    return () => {
      active = false;
    };
  }, [token]);

  const subtitle = useMemo(() => {
    if (!invitation) {
      return "Set your password to activate your internal account.";
    }

    return `Welcome ${invitation.fullName}. Create your password to finish setup.`;
  }, [invitation]);

  async function onSubmit(values) {
    if (!token || !invitation) {
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      await acceptInvitationRequest(token, values.password);

      if (String(invitation.accountStatus || "active").toLowerCase() === "active") {
        const { profile } = await login({
          email: invitation.email,
          password: values.password,
        });
        router.replace(getPostLoginRoute(profile) || AUTH_ROUTES.LOGIN);
        return;
      }

      Alert.alert(
        "Invitation accepted",
        "Your account was created, but it is currently inactive. Please contact an administrator for access."
      );
      router.replace(AUTH_ROUTES.LOGIN);
    } catch (err) {
      setFormError(getFriendlyErrorMessage(err, "Unable to accept this invitation."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingSpinner label="Checking invitation..." />;
  }

  if (validationError || !invitation) {
    return (
      <AuthShell
        title="Invitation link"
        subtitle="We could not open this invitation."
        footer={
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Have an account already?</Text>
            <Link href={AUTH_ROUTES.LOGIN} style={styles.footerLink}>
              Sign in
            </Link>
          </View>
        }
      >
        <EmptyState
          title="Invitation unavailable"
          description={validationError || "The invitation link could not be verified."}
          actionLabel="Back to login"
          onAction={() => router.replace(AUTH_ROUTES.LOGIN)}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Accept invitation" subtitle={subtitle}>
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>{invitation.email}</Text>
        <Text style={styles.infoLabel}>Role</Text>
        <Text style={styles.infoValue}>{String(invitation.role || "-").toUpperCase()}</Text>
        <Text style={styles.infoLabel}>Account Status</Text>
        <Text style={styles.infoValue}>{String(invitation.accountStatus || "active").toUpperCase()}</Text>
      </View>

      {formError ? <Text style={styles.errorBanner}>{formError}</Text> : null}

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
        title="Activate account"
        onPress={handleSubmit(onSubmit)}
        loading={submitting}
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
