import { useState } from "react";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { RegisterStepLayout } from "../components/register/RegisterStepLayout";
import { AppTextInput } from "../components/AppTextInput";
import { AppButton } from "../components/AppButton";
import { ErrorBanner } from "../components/ErrorBanner";
import { useRegistration } from "../context/RegistrationContext";
import { validate_register_email } from "../lib/register_validation";

type Props = RootStackScreenProps<"RegisterEmail">;

export function RegisterEmailScreen({ navigation }: Props) {
  const { formData, update_form_data } = useRegistration();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handle_continue = () => {
    const error = validate_register_email(formData.email);
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage(null);
    update_form_data({ email: formData.email.trim() });
    navigation.navigate("RegisterPassword");
  };

  return (
    <ScreenContainer padded={false}>
      <RegisterStepLayout
        step={2}
        title="Your email"
        subtitle="We'll use this to sign you in"
        showBack
        onBack={() => navigation.goBack()}
      >
        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
        <AppTextInput
          label="Email"
          value={formData.email}
          onChangeText={(value) => update_form_data({ email: value })}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoComplete="email"
        />
        <AppButton label="Continue" onPress={handle_continue} />
      </RegisterStepLayout>
    </ScreenContainer>
  );
}
