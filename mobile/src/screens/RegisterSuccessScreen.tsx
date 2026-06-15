import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AppButton } from "../components/AppButton";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = RootStackScreenProps<"RegisterSuccess">;

export function RegisterSuccessScreen({ navigation, route }: Props) {
  const students = route.params?.generatedStudents ?? [];

  return (
    <ScreenContainer>
      <Text style={styles.title}>Account created</Text>
      <Text style={styles.body}>
        Your teacher account is ready. Pupil credentials are listed below if the server
        generated them automatically.
      </Text>
      {students.length > 0 ? (
        <ScrollView style={styles.list}>
          {students.map((student) => (
            <View key={student.email} style={styles.card}>
              <Text style={styles.name}>{student.name}</Text>
              <Text style={styles.meta}>{student.email}</Text>
              <Text style={styles.meta}>Password: {student.password}</Text>
            </View>
          ))}
        </ScrollView>
      ) : null}
      <AppButton
        label="Continue to sign in"
        onPress={() => navigation.reset({ index: 0, routes: [{ name: "Login" }] })}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.displayTitle,
    color: colors.text,
    marginBottom: 8,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: 20,
    lineHeight: 22,
  },
  list: {
    maxHeight: 240,
    marginBottom: 16,
  },
  card: {
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 12,
    marginBottom: 8,
    gap: 4,
  },
  name: {
    ...typography.bodySemiBold,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
