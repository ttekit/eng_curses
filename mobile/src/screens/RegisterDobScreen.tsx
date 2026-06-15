import { useState } from "react";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { RegisterStepLayout } from "../components/register/RegisterStepLayout";
import { AppButton } from "../components/AppButton";
import { ErrorBanner } from "../components/ErrorBanner";
import { TurnstileWebView } from "../components/TurnstileWebView";
import { useRegistration } from "../context/RegistrationContext";
import { use_turnstile_captcha } from "../hooks/use_turnstile_captcha";
import { setStoredAccessToken } from "../lib/api";
import { register_user } from "../lib/register_user";

type Props = RootStackScreenProps<"RegisterDob">;

export function RegisterDobScreen({ navigation }: Props) {
  const { formData } = useRegistration();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { captchaToken, captchaKey, setCaptchaToken, reset_captcha } =
    use_turnstile_captcha();

  const handle_continue = async () => {
    if (!captchaToken) {
      setErrorMessage("Please wait for captcha verification.");
      return;
    }
    setErrorMessage(null);
    setLoading(true);
    const result = await register_user(formData, captchaToken);
    setLoading(false);
    if (!result.success) {
      setErrorMessage(result.message);
      reset_captcha();
      return;
    }
    if (result.accessToken) {
      await setStoredAccessToken(result.accessToken);
    }
    if (result.requiresEmailVerification) {
      navigation.navigate("VerifyEmail", { email: formData.email.trim() });
      return;
    }
    navigation.navigate("RegisterDetails");
  };

  return (
    <ScreenContainer padded={false}>
      <RegisterStepLayout
        step={4}
        title="Create your account"
        subtitle="Confirm you are human, then continue to personalize your learning"
        showBack
        onBack={() => navigation.goBack()}
      >
        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
        <TurnstileWebView
          resetKey={captchaKey}
          onToken={setCaptchaToken}
          onExpire={reset_captcha}
        />
        <AppButton
          label="Continue"
          loading={loading}
          disabled={!captchaToken}
          onPress={() => void handle_continue()}
        />
      </RegisterStepLayout>
    </ScreenContainer>
  );
}
