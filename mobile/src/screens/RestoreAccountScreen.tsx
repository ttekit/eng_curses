import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AuthShell } from "../components/AuthShell";
import { AppTextInput } from "../components/AppTextInput";
import { AppButton } from "../components/AppButton";
import { ErrorBanner } from "../components/ErrorBanner";
import { apiFetch, readApiErrorBody } from "../lib/api";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

type Props = RootStackScreenProps<"RestoreAccount">;

export function RestoreAccountScreen({ navigation, route }: Props) {
  const [email, setEmail] = useState(route.params?.email ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handle_restore = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!email.trim()) {
      setErrorMessage("Enter your account email.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch("/auth/restore-account", {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!response.ok) {
        setErrorMessage(await readApiErrorBody(response));
        return;
      }
      setSuccessMessage("Account restored. You can sign in now.");
    } catch {
      setErrorMessage("Could not restore account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer padded={false}>
      <AuthShell>
        <Text style={styles.title}>Restore account</Text>
        <Text style={styles.body}>
          If your account was deactivated, enter your email to reactivate it.
        </Text>
        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
        {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}
        <AppTextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <AppButton label="Restore" loading={loading} onPress={() => void handle_restore()} />
        <AppButton
          label="Back to sign in"
          variant="ghost"
          onPress={() => navigation.navigate("Login")}
        />
      </AuthShell>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
  },
  success: {
    ...typography.caption,
    color: colors.accent,
    textAlign: "center",
  },
});
