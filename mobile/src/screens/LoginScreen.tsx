import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AuthShell } from "../components/AuthShell";
import { AppTextInput } from "../components/AppTextInput";
import { AppButton } from "../components/AppButton";
import { BrandLogo } from "../components/BrandLogo";
import { ErrorBanner } from "../components/ErrorBanner";
import { TurnstileWebView } from "../components/TurnstileWebView";
import { apiFetch, readApiErrorBody, setStoredAccessToken } from "../lib/api";
import { use_turnstile_captcha } from "../hooks/use_turnstile_captcha";
import { resolvePostLoginRoute } from "../lib/learnerOnboarding";
import { useUser } from "../context/UserContext";
import { loginScreenStyles as styles } from "./login_screen_styles";

type Props = RootStackScreenProps<"Login">;

export function LoginScreen({ navigation }: Props) {
  const { refreshProfile } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { captchaToken, captchaKey, setCaptchaToken, reset_captcha } =
    use_turnstile_captcha();

  const handle_login = async () => {
    setErrorMessage(null);
    if (!email.trim() || !password.trim()) {
      setErrorMessage("Enter your email and password.");
      return;
    }
    if (show2FA && twoFactorCode.trim().length !== 6) {
      setErrorMessage("Enter the 6-digit verification code.");
      return;
    }
    if (!captchaToken) {
      setErrorMessage("Please wait for captcha verification.");
      return;
    }

    setLoading(true);
    try {
      const endpoint = show2FA ? "/auth/verify-2fa" : "/auth/login";
      const response = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          email: email.trim(),
          password,
          captchaToken,
          ...(show2FA ? { code: twoFactorCode.trim() } : {}),
        }),
      });

      if (!response.ok) {
        const message = await readApiErrorBody(response);
        setErrorMessage(message);
        reset_captcha();
        return;
      }

      const data = (await response.json()) as {
        access_token?: string;
        requiresTwoFactor?: boolean;
      };

      if (data.requiresTwoFactor) {
        setShow2FA(true);
        Alert.alert("2FA", "We sent a verification code to your email.");
        return;
      }

      if (data.access_token) {
        await setStoredAccessToken(data.access_token);
      }

      const profile = await refreshProfile();
      const route = resolvePostLoginRoute(profile);
      navigation.reset({
        index: 0,
        routes: [{ name: route }],
      });
    } catch {
      setErrorMessage("Could not reach the Explys API.");
      reset_captcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer padded={false}>
      <AuthShell centered>
        <View style={styles.hero}>
          <BrandLogo />
          <Text style={styles.welcome}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue learning</Text>
        </View>

        <View style={styles.form}>
          {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
          <AppTextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
            editable={!show2FA}
          />
          {!show2FA ? (
            <AppTextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          ) : (
            <AppTextInput
              label="Verification code"
              value={twoFactorCode}
              onChangeText={setTwoFactorCode}
              keyboardType="number-pad"
              maxLength={6}
              centered
            />
          )}

          <TurnstileWebView
            resetKey={captchaKey}
            onToken={setCaptchaToken}
            onExpire={reset_captcha}
          />

          <AppButton
            label={show2FA ? "Verify & sign in" : "Sign in"}
            loading={loading}
            disabled={!captchaToken}
            onPress={() => {
              void handle_login();
            }}
          />
          <Pressable onPress={() => navigation.navigate("RegisterName")}>
            <Text style={styles.footerLink}>Create an account</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("RestoreAccount", {})}>
            <Text style={styles.footerLink}>Restore deactivated account</Text>
          </Pressable>
        </View>
      </AuthShell>
    </ScreenContainer>
  );
}
