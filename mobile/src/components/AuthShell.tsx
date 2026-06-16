import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

type AuthShellProps = {
  children: ReactNode;
  centered?: boolean;
};

export function AuthShell({ children, centered = false }: AuthShellProps) {
  return (
    <LinearGradient
      colors={["rgba(129, 61, 236, 0.28)", colors.background]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            centered ? styles.scrollCentered : null,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

type RegistrationProgressProps = {
  step: number;
  total?: number;
};

export function RegistrationProgress({
  step,
  total = 3,
}: RegistrationProgressProps) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }, (_, index) => (
        <View
          key={String(index)}
          style={[
            styles.progressDot,
            index < step ? styles.progressDotActive : null,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  gradient: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: 32,
    gap: spacing.itemGap,
  },
  scrollCentered: {
    justifyContent: "center",
    gap: 28,
  },
  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: colors.muted,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
});
