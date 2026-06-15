import { StyleSheet, Text, View } from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AppButton } from "../components/AppButton";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

type Props = RootStackScreenProps<"NotFound">;

export function NotFoundScreen({ navigation }: Props) {
  return (
    <ScreenContainer>
      <View style={styles.wrap}>
        <Text style={styles.code}>404</Text>
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.body}>This screen does not exist in the mobile app.</Text>
        <AppButton
          label="Go to catalog"
          onPress={() =>
            navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] })
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  code: {
    ...typography.displayTitle,
    color: colors.primary,
    fontSize: 48,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    marginBottom: 12,
  },
});
