import { useState } from "react";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { RegisterStepLayout } from "../components/register/RegisterStepLayout";
import { AppTextInput } from "../components/AppTextInput";
import { AppButton } from "../components/AppButton";
import { ErrorBanner } from "../components/ErrorBanner";
import { useRegistration } from "../context/RegistrationContext";
import { validate_register_passwords } from "../lib/register_validation";

type Props = RootStackScreenProps<"RegisterPassword">;

export function RegisterPasswordScreen({ navigation }: Props) {
  const { formData, update_form_data } = useRegistration();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handle_continue = () => {
    const error = validate_register_passwords(
      formData.password,
      formData.confirmPassword,
    );
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage(null);
    navigation.navigate("RegisterDob");
  };

  return (
    <ScreenContainer padded={false}>
      <RegisterStepLayout
        step={3}
        title="Create a password"
        subtitle="Use 8+ characters with upper, lower, number, and special character"
        showBack
        onBack={() => navigation.goBack()}
      >
        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
        <AppTextInput
          label="Password"
          value={formData.password}
          onChangeText={(value) => update_form_data({ password: value })}
          placeholder="Create a password"
          secureTextEntry
          autoComplete="new-password"
        />
        <AppTextInput
          label="Confirm password"
          value={formData.confirmPassword}
          onChangeText={(value) => update_form_data({ confirmPassword: value })}
          placeholder="Repeat your password"
          secureTextEntry
          autoComplete="new-password"
        />
        <AppButton label="Continue" onPress={handle_continue} />
      </RegisterStepLayout>
    </ScreenContainer>
  );
}
