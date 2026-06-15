import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AuthShell, RegistrationProgress } from "../components/AuthShell";
import { AppTextInput } from "../components/AppTextInput";
import { AppButton } from "../components/AppButton";
import { ErrorBanner } from "../components/ErrorBanner";
import { useRegistration } from "../context/RegistrationContext";
import { useUser } from "../context/UserContext";
import { apiFetch, readApiErrorBody } from "../lib/api";
import { resolvePostLoginRoute } from "../lib/learnerOnboarding";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = RootStackScreenProps<"RegisterPreferences">;
type GenreOption = { id: number; name: string };

export function RegisterPreferencesScreen({ navigation }: Props) {
  const { formData, update_form_data } = useRegistration();
  const { refreshProfile } = useUser();
  const [genres, setGenres] = useState<GenreOption[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      const response = await apiFetch("/genres", { method: "GET" });
      if (!response.ok) {
        return;
      }
      const data = (await response.json()) as GenreOption[];
      setGenres(Array.isArray(data) ? data : []);
    };
    void load();
  }, []);

  const toggle_favorite = (id: number) => {
    const favorites = formData.favoriteGenres;
    const hated = formData.hatedGenres;
    const nextFavorites = favorites.includes(id)
      ? favorites.filter((value) => value !== id)
      : [...favorites, id];
    update_form_data({
      favoriteGenres: nextFavorites,
      hatedGenres: hated.filter((value) => !nextFavorites.includes(value)),
    });
  };

  const handle_submit = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      const response = await apiFetch("/auth/update-preferences", {
        method: "POST",
        body: JSON.stringify({
          role: formData.role,
          dateOfBirth: formData.dateOfBirth,
          favoriteGenres: formData.favoriteGenres,
          hatedGenres: formData.hatedGenres,
          learningGoal: formData.learningGoal,
          timeToAchieve: formData.timeToAchieve,
        }),
      });
      if (!response.ok) {
        setErrorMessage(await readApiErrorBody(response));
        return;
      }
      const profile = await refreshProfile();
      const route = resolvePostLoginRoute(profile);
      navigation.reset({ index: 0, routes: [{ name: route }] });
    } catch {
      setErrorMessage("Could not save preferences.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer padded={false}>
      <AuthShell>
        <RegistrationProgress step={6} total={6} />
        <Text style={styles.title}>Learning preferences</Text>
        {errorMessage ? <ErrorBanner message={errorMessage} /> : null}
        <Text style={styles.label}>Favorite genres</Text>
        <View style={styles.chipRow}>
          {genres.map((genre) => (
            <Pressable
              key={genre.id}
              onPress={() => toggle_favorite(genre.id)}
              style={[
                styles.chip,
                formData.favoriteGenres.includes(genre.id) ? styles.chipActive : null,
              ]}
            >
              <Text style={styles.chipText}>{genre.name}</Text>
            </Pressable>
          ))}
        </View>
        {formData.role === "adult" ? (
          <>
            <AppTextInput
              label="Learning goal"
              value={formData.learningGoal}
              onChangeText={(value) => update_form_data({ learningGoal: value })}
              placeholder="Travel, career, exams..."
            />
            <AppTextInput
              label="Time to achieve"
              value={formData.timeToAchieve}
              onChangeText={(value) => update_form_data({ timeToAchieve: value })}
              placeholder="3 months, 1 year..."
            />
          </>
        ) : null}
        <AppButton label="Finish" loading={loading} onPress={() => void handle_submit()} />
      </AuthShell>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  label: {
    ...typography.label,
    color: colors.textMuted,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: spacing.pillRadius,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.card,
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: "rgba(129, 61, 236, 0.15)",
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
  },
});
