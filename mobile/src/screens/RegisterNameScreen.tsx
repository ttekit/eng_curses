import { useState } from "react";
import { Pressable, Text } from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { RegisterStepLayout } from "../components/register/RegisterStepLayout";
import { AppTextInput } from "../components/AppTextInput";
import { AppButton } from "../components/AppButton";
import { ErrorBanner } from "../components/ErrorBanner";
import { useRegistration } from "../context/RegistrationContext";
import { validate_register_name } from "../lib/register_validation";
import { registerStepStyles as styles } from "./register_step_styles";

type Props = RootStackScreenProps<"RegisterName">;

export function RegisterNameScreen({ navigation }: Props) {
  const { formData, update_form_data } = useRegistration();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handle_continue = () => {
    const error = validate_register_name(formData.name);
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage(null);
    navigation.navigate("RegisterEmail");
  };

  return (
    <ScreenContainer padded={false}>
      <RegisterStepLayout
        step={1}
        title="Join Exply"
        subtitle="Let's start with your name"
        footer={
          <Pressable onPress={() => navigation.navigate("Login")}>
            <Text style={styles.footerLink}>Already have an account? Sign in</Text>
          </Pressable>
        }
      >
        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
        <AppTextInput
          label="Full name"
          value={formData.name}
          onChangeText={(value) => update_form_data({ name: value })}
          placeholder="Enter your name"
          autoComplete="name"
        />
        <AppButton label="Continue" onPress={handle_continue} />
      </RegisterStepLayout>
    </ScreenContainer>
  );
}
