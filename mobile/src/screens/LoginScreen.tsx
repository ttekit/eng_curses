import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AppTextInput } from "../components/AppTextInput";
import { AppButton } from "../components/AppButton";
import { TurnstileWebView } from "../components/TurnstileWebView";
import { apiFetch, readApiErrorBody, setStoredAccessToken } from "../lib/api";
import { resolvePostLoginRoute } from "../lib/learnerOnboarding";
import { useUser } from "../context/UserContext";
import { colors } from "../theme/colors";

type Props = RootStackScreenProps<"Login">;

export function LoginScreen({ navigation }: Props) {
  const { refreshProfile } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [show2FA, setShow2FA] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const resetCaptcha = () => {
    setCaptchaToken(null);
    setCaptchaKey((value) => value + 1);
  };

  const handleLogin = async () => {
    if (!captchaToken) {
      Alert.alert("Verification", "Complete the security check before signing in.");
      return;
    }
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Enter your email and password.");
      return;
    }
    if (show2FA && twoFactorCode.trim().length !== 6) {
      Alert.alert("2FA", "Enter the 6-digit verification code.");
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
        Alert.alert("Sign in failed", message);
        resetCaptcha();
        return;
      }

      const data = (await response.json()) as {
        access_token?: string;
        requiresTwoFactor?: boolean;
      };

      if (data.requiresTwoFactor) {
        setShow2FA(true);
        resetCaptcha();
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
      Alert.alert("Network error", "Could not reach the Explys API.");
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.brand}>
            Ex<Text style={styles.brandAccent}>ply</Text>s
          </Text>
          <Text style={styles.subtitle}>Sign in to continue learning</Text>

          <View style={styles.form}>
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
              />
            )}

            <TurnstileWebView
              resetKey={captchaKey}
              onToken={setCaptchaToken}
              onExpire={resetCaptcha}
            />

            <AppButton
              label={show2FA ? "Verify & sign in" : "Sign in"}
              loading={loading}
              onPress={() => {
                void handleLogin();
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 32,
  },
  brand: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 8,
  },
  brandAccent: {
    color: colors.primary,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginBottom: 28,
  },
  form: {
    gap: 16,
  },
});
