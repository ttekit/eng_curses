import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AppTextInput } from "../components/AppTextInput";
import { AppButton } from "../components/AppButton";
import { ErrorBanner } from "../components/ErrorBanner";
import { apiFetch, readApiErrorBody } from "../lib/api";
import { useUser } from "../context/UserContext";
import { format_date_of_birth_input } from "../lib/date_of_birth_input";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

type Props = RootStackScreenProps<"OnboardingDob">;

export function OnboardingDobScreen({ navigation }: Props) {
  const { user, refreshProfile } = useUser();
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ?? "");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handle_save = async () => {
    setErrorMessage(null);
    if (!dateOfBirth.trim()) {
      setErrorMessage("Enter your date of birth.");
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetch("/users/profile", {
        method: "PATCH",
        body: JSON.stringify({ dateOfBirth: dateOfBirth.trim() }),
      });
      if (!response.ok) {
        setErrorMessage(await readApiErrorBody(response));
        return;
      }
      await refreshProfile();
      navigation.reset({ index: 0, routes: [{ name: "OnboardingIntro" }] });
    } catch {
      setErrorMessage("Could not save date of birth.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Date of birth</Text>
      <Text style={styles.body}>
        We need your date of birth to personalize lessons and age-restricted content.
      </Text>
      {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
      <AppTextInput
        label="Date of birth (YYYY-MM-DD)"
        value={dateOfBirth}
        onChangeText={(value) => setDateOfBirth(format_date_of_birth_input(value))}
        placeholder="2000-01-15"
        keyboardType="number-pad"
        maxLength={10}
      />
      <AppButton label="Continue" loading={loading} onPress={() => void handle_save()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.sectionTitle,
    color: colors.text,
    marginBottom: 8,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: 20,
    lineHeight: 22,
  },
});
