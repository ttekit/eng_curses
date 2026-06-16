import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

type ErrorBannerProps = {
  message: string;
};

export function ErrorBanner({ message }: ErrorBannerProps) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.destructive,
    backgroundColor: "rgba(171, 16, 65, 0.12)",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  text: {
    ...typography.caption,
    color: colors.danger,
    textAlign: "center",
  },
});
