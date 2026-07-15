import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, ScrollView, StyleSheet, Text, View, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import AppHeader from "../../../components/AppHeader";
import CreationMethodSelector from "../../../components/CreationMethodSelector";
import FormField from "../../../components/FormField";
import PrimaryButton from "../../../components/PrimaryButton";
import ScreenContainer from "../../../components/ScreenContainer";
import StatusBadge from "../../../components/StatusBadge";
import COLORS from "../../../constants/colors";
import { ROLES } from "../../../constants/roles";
import { useAuth } from "../../../contexts/AuthContext";
import { createInternalUserDirect, createInvitationRequest } from "../../../services/adminApiService";
import { getAllowedInternalRoles } from "../../../services/internalUserService";
import { isStrongPassword } from "../../../utils/security";

const ALLOWED_ROLES = getAllowedInternalRoles();
const STATUS_OPTIONS = ["active", "inactive"];
const METHOD_OPTIONS = ["direct", "invitation"];

const schema = yup.object({
  method: yup.string().oneOf(METHOD_OPTIONS).required(),
  fullName: yup.string().trim().min(3, "Enter a full name").required("Full name is required"),
  email: yup.string().trim().email("Enter a valid email").required("Email is required"),
  phone: yup.string().trim().min(7, "Enter a valid phone number").required("Phone number is required"),
  role: yup.string().oneOf(ALLOWED_ROLES, "Choose an internal role").required("Role is required"),
  status: yup.string().oneOf(STATUS_OPTIONS, "Choose a valid status").required("Status is required"),
  tempPassword: yup
    .string()
    .when("method", {
      is: "direct",
      then: (value) =>
        value
          .min(8, "Temporary password must be at least 8 characters")
          .test(
            "strong-password",
            "Use upper and lower case letters and at least one number.",
            (nextValue) => isStrongPassword(nextValue)
          )
          .required("Temporary password is required"),
      otherwise: (value) => value.notRequired(),
    }),
  confirmPassword: yup
    .string()
    .when("method", {
      is: "direct",
      then: (value) =>
        value.oneOf([yup.ref("tempPassword")], "Passwords must match").required("Confirm the temporary password"),
      otherwise: (value) => value.notRequired(),
    }),
  invitationExpiry: yup
    .number()
    .typeError("Choose a valid invitation expiry")
    .when("method", {
      is: "invitation",
      then: (value) =>
        value.min(1, "Invitation expiry must be at least 1 day").max(30, "Invitation expiry must be 30 days or less").required("Invitation expiry is required"),
      otherwise: (value) => value.notRequired(),
    }),
});

function FormSectionTitle({ title, subtitle }) {
  return (
    <View style={styles.sectionCopy}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export default function AdminCreateUserScreen() {
  const router = useRouter();
  const { currentUser, userProfile } = useAuth();
  const [method, setMethod] = useState("direct");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      method: "direct",
      fullName: "",
      email: "",
      phone: "",
      role: ROLES.STAFF,
      status: "active",
      tempPassword: "",
      confirmPassword: "",
      invitationExpiry: 7,
    },
  });

  const selectedMethod = watch("method");
  const selectedRole = watch("role");

  const isDirect = selectedMethod === "direct";
  const isInvitation = selectedMethod === "invitation";

  const methodHint = useMemo(() => {
    if (isDirect) {
      return "Create the account now and hand over a temporary password.";
    }

    return "Create a secure invitation link and let the user finish setup.";
  }, [isDirect]);

  async function onSubmit(values) {
    setError("");
    setSuccess(null);
    setLoading(true);

    try {
      if (values.method === "direct") {
        const result = await createInternalUserDirect(
          {
            fullName: values.fullName,
            email: values.email,
            phone: values.phone,
            role: values.role,
            status: values.status,
            password: values.tempPassword,
          },
          currentUser?.uid
        );

        setSuccess({
          type: "direct",
          message: "Direct account created successfully.",
          detail: `${result.user.fullName} can now log in with the temporary password entered on this form.`,
        });
        Alert.alert("Account created", "The internal account has been created successfully.");
        return;
      }

      const result = await createInvitationRequest(
        {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          role: values.role,
          status: values.status,
          expiryDays: Number(values.invitationExpiry || 7),
        },
        currentUser?.uid
      );

      setSuccess({
        type: "invitation",
        message: "Invitation created successfully.",
        detail: `Target account status: ${String(result.invitation.accountStatus || "active").toUpperCase()}\n${result.invitationUrl}`,
      });
      Alert.alert("Invitation created", "The invitation is ready to send.");
    } catch (err) {
      setError(err?.message || "Unable to create the account right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScreenContainer scroll={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <AppHeader
            title="Create User"
            subtitle="Choose how to add an internal account."
            userName={currentUser?.displayName || userProfile?.fullName || "Admin"}
            role={(userProfile?.role || ROLES.ADMIN).toUpperCase()}
          />

          <View style={styles.panel}>
            <FormSectionTitle
              title="Creation method"
              subtitle="Direct accounts need a temporary password. Invitations let the user set one."
            />
            <CreationMethodSelector
              value={method}
              onChange={(next) => {
                setMethod(next);
                setValue("method", next, { shouldValidate: true });
              }}
            />
            <Text style={styles.helper}>{methodHint}</Text>
          </View>

          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

          {success ? (
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>{success.message}</Text>
              <Text style={styles.successText}>{success.detail}</Text>
              <Pressable
                onPress={() => router.replace("/(admin)/users")}
                style={styles.successAction}
              >
                <Text style={styles.successActionText}>Back to users</Text>
              </Pressable>
            </View>
          ) : null}

          <View style={styles.panel}>
            <FormSectionTitle
              title="User details"
              subtitle="Use the same fields for both creation methods."
            />

            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Full Name"
                  placeholder="Full name"
                  autoCapitalize="words"
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
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.phone?.message}
                />
              )}
            />

            <Text style={styles.fieldLabel}>Role</Text>
            <View style={styles.optionRow}>
              {ALLOWED_ROLES.map((item) => {
                const active = selectedRole === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setValue("role", item, { shouldValidate: true })}
                    style={[styles.optionChip, active ? styles.optionChipActive : null]}
                  >
                    <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {errors.role ? <Text style={styles.inlineError}>{errors.role.message}</Text> : null}

            <Text style={styles.fieldLabel}>Status</Text>
            <View style={styles.optionRow}>
              {STATUS_OPTIONS.map((item) => {
                const active = watch("status") === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setValue("status", item, { shouldValidate: true })}
                    style={[styles.optionChip, active ? styles.optionChipActive : null]}
                  >
                    <Text style={[styles.optionText, active ? styles.optionTextActive : null]}>
                      {item}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {errors.status ? <Text style={styles.inlineError}>{errors.status.message}</Text> : null}
          </View>

          {isDirect ? (
            <View style={styles.panel}>
              <FormSectionTitle
                title="Temporary password"
                subtitle="This password should be shared securely before the user logs in."
              />

              <Controller
                control={control}
                name="tempPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="Temporary Password"
                    placeholder="Create a temporary password"
                    secureTextEntry={!showPassword}
                    autoComplete="new-password"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.tempPassword?.message}
                    rightAccessory={
                      <Pressable onPress={() => setShowPassword((current) => !current)} hitSlop={10}>
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
                    placeholder="Repeat the temporary password"
                    secureTextEntry={!showConfirmPassword}
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

              <View style={styles.noteBox}>
                <StatusBadge label="mustChangePassword = true" variant="warning" />
                <Text style={styles.noteText}>
                  The user must change this password after the first login.
                </Text>
              </View>
            </View>
          ) : null}

          {isInvitation ? (
            <View style={styles.panel}>
              <FormSectionTitle
                title="Invitation settings"
                subtitle="The user receives a single-use invitation link."
              />

              <Controller
                control={control}
                name="invitationExpiry"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="Invitation Expiry"
                    placeholder="7"
                    keyboardType="numeric"
                    value={String(value ?? "")}
                    onBlur={onBlur}
                    onChangeText={(nextValue) => {
                      const parsed = Number(nextValue);
                      onChange(Number.isFinite(parsed) ? parsed : nextValue);
                    }}
                    helperText="Choose a value between 1 and 30 days."
                    error={errors.invitationExpiry?.message}
                  />
                )}
              />
            </View>
          ) : null}

          <PrimaryButton
            title={isDirect ? "Create Account" : "Create Invitation"}
            onPress={handleSubmit(onSubmit)}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 14,
  },
  panel: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 14,
  },
  sectionCopy: {
    gap: 4,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: COLORS.mutedText,
    fontSize: 13,
    lineHeight: 19,
  },
  helper: {
    color: COLORS.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  optionText: {
    color: COLORS.mutedText,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  optionTextActive: {
    color: COLORS.white,
  },
  inlineError: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: "700",
  },
  noteBox: {
    gap: 8,
    padding: 14,
    borderRadius: 18,
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  noteText: {
    color: COLORS.mutedText,
    fontSize: 12,
    lineHeight: 18,
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
  successCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(34, 139, 91, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(34, 139, 91, 0.16)",
    gap: 8,
  },
  successTitle: {
    color: COLORS.success,
    fontSize: 15,
    fontWeight: "900",
  },
  successText: {
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 19,
  },
  successAction: {
    alignSelf: "flex-start",
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
  },
  successActionText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
});
