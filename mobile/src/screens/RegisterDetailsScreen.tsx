import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AuthShell, RegistrationProgress } from "../components/AuthShell";
import { AppTextInput } from "../components/AppTextInput";
import { AppButton } from "../components/AppButton";
import { ErrorBanner } from "../components/ErrorBanner";
import { useRegistration } from "../context/RegistrationContext";
import { validate_register_dob } from "../lib/register_validation";
import { format_date_of_birth_input } from "../lib/date_of_birth_input";
import { apiFetch, readApiErrorBody } from "../lib/api";
import type { GeneratedStudentAccount } from "../lib/register_user";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = RootStackScreenProps<"RegisterDetails">;

const ROLES = ["adult", "student", "teacher"] as const;

export function RegisterDetailsScreen({ navigation }: Props) {
  const { formData, update_form_data } = useRegistration();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handle_submit = async () => {
    setErrorMessage(null);
    if (formData.role === "choose" || !formData.role) {
      setErrorMessage("Select your learner type.");
      return;
    }
    const dobError = validate_register_dob(formData.dateOfBirth);
    if (dobError) {
      setErrorMessage(dobError);
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        role: formData.role.toUpperCase(),
        dateOfBirth: formData.dateOfBirth,
      };
      if (formData.role === "teacher") {
        payload.teacherGrades = formData.teacherGrades;
        payload.teacherTopics = formData.teacherTopics;
        payload.studentNames = Array.isArray(formData.studentNames)
          ? formData.studentNames
          : [];
      }
      const response = await apiFetch("/auth/update-preferences", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setErrorMessage(await readApiErrorBody(response));
        return;
      }
      const data = (await response.json()) as {
        generatedStudents?: GeneratedStudentAccount[];
      };
      if (formData.role === "teacher") {
        navigation.navigate("RegisterSuccess", {
          generatedStudents: data.generatedStudents,
        });
        return;
      }
      navigation.navigate("RegisterPreferences");
    } catch {
      setErrorMessage("Could not save registration details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer padded={false}>
      <AuthShell>
        <RegistrationProgress step={5} total={6} />
        <Text style={styles.title}>Who is learning?</Text>
        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
        <View style={styles.roleRow}>
          {ROLES.map((role) => (
            <Pressable
              key={role}
              onPress={() => update_form_data({ role })}
              style={[
                styles.roleChip,
                formData.role === role ? styles.roleChipActive : null,
              ]}
            >
              <Text
                style={[
                  styles.roleLabel,
                  formData.role === role ? styles.roleLabelActive : null,
                ]}
              >
                {role}
              </Text>
            </Pressable>
          ))}
        </View>
        {formData.role === "teacher" ? (
          <Text style={styles.hint}>
            Teacher accounts can add pupils after signup on the web dashboard.
          </Text>
        ) : null}
        <AppTextInput
          label="Date of birth (YYYY-MM-DD)"
          value={formData.dateOfBirth}
          onChangeText={(value) =>
            update_form_data({ dateOfBirth: format_date_of_birth_input(value) })
          }
          placeholder="2000-01-15"
          keyboardType="number-pad"
          maxLength={10}
        />
        <AppButton label="Continue" loading={loading} onPress={() => void handle_submit()} />
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Back</Text>
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
  roleRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  roleChip: {
    borderRadius: spacing.pillRadius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.card,
  },
  roleChipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(129, 61, 236, 0.15)",
  },
  roleLabel: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: "capitalize",
  },
  roleLabelActive: {
    color: colors.primary,
    fontFamily: typography.bodySemiBold.fontFamily,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
  },
  link: {
    ...typography.caption,
    color: colors.primary,
    textAlign: "center",
  },
});
