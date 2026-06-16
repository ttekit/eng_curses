import { Linking, StyleSheet, Text, View } from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AppButton } from "../components/AppButton";
import { LEGAL_DOCUMENTS } from "../lib/legal_content";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

type Props = RootStackScreenProps<"LegalDocument">;

export function LegalDocumentScreen({ route }: Props) {
  const document = LEGAL_DOCUMENTS[route.params.slug];

  return (
    <ScreenContainer>
      <Text style={styles.title}>{document.title}</Text>
      <Text style={styles.body}>{document.summary}</Text>
      <View style={styles.actions}>
        <AppButton
          label="Read full document"
          onPress={() => void Linking.openURL(document.webUrl)}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.sectionTitle,
    color: colors.text,
    marginBottom: 12,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 24,
    marginBottom: 24,
  },
  actions: {
    gap: 12,
  },
});
