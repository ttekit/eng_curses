import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AuthShell } from "../components/AuthShell";
import { AppTextInput } from "../components/AppTextInput";
import { AppButton } from "../components/AppButton";
import { ErrorBanner } from "../components/ErrorBanner";
import { apiFetch, readApiErrorBody, setStoredAccessToken } from "../lib/api";
import { useUser } from "../context/UserContext";
import { resolvePostLoginRoute } from "../lib/learnerOnboarding";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

type Props = RootStackScreenProps<"VerifyEmail">;

export function EmailVerificationScreen({ navigation, route }: Props) {
  const { refreshProfile } = useUser();
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(59);
  const email = route.params.email;

  useEffect(() => {
    if (timer <= 0) {
      return;
    }
    const interval = setInterval(() => setTimer((value) => value - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handle_verify = async () => {
    setErrorMessage(null);
    if (code.trim().length !== 6) {
      setErrorMessage("Enter the 6-digit code from your email.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email, code: code.trim() }),
      });
      if (!response.ok) {
        setErrorMessage(await readApiErrorBody(response));
        return;
      }
      const data = (await response.json()) as { access_token?: string };
      if (data.access_token) {
        await setStoredAccessToken(data.access_token);
      }
      const profile = await refreshProfile();
      const nextRoute = resolvePostLoginRoute(profile);
      navigation.reset({ index: 0, routes: [{ name: nextRoute }] });
    } catch {
      setErrorMessage("Could not verify your email.");
    } finally {
      setLoading(false);
    }
  };

  const handle_resend = async () => {
    if (timer > 0) {
      return;
    }
    await apiFetch("/auth/resend-confirmation", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
    setTimer(59);
  };

  return (
    <ScreenContainer padded={false}>
      <AuthShell>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.body}>We sent a code to {email}</Text>
        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
        <AppTextInput
          label="Verification code"
          value={code}
          onChangeText={setCode}
          keyboardType="number-pad"
          maxLength={6}
          centered
        />
        <AppButton label="Verify" loading={loading} onPress={() => void handle_verify()} />
        <Pressable disabled={timer > 0} onPress={() => void handle_resend()}>
          <Text style={styles.link}>
            {timer > 0 ? `Resend in ${timer}s` : "Resend code"}
          </Text>
        </Pressable>
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
  link: {
    ...typography.caption,
    color: colors.primary,
    textAlign: "center",
  },
});
