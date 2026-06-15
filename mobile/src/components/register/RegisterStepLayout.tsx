import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { AuthShell, RegistrationProgress } from "../AuthShell";
import { ChameleonMascot } from "../ChameleonMascot";
import { registerStepStyles as styles } from "../../screens/register_step_styles";

type RegisterStepLayoutProps = {
  step: number;
  total?: number;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function RegisterStepLayout({
  step,
  total = 6,
  title,
  subtitle,
  showBack = false,
  onBack,
  children,
  footer,
}: RegisterStepLayoutProps) {
  return (
    <AuthShell>
      {showBack && onBack ? (
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button">
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Feather name="arrow-left" size={16} color={styles.backText.color} />
            <Text style={styles.backText}>Back</Text>
          </View>
        </Pressable>
      ) : null}
      <RegistrationProgress step={step} total={total} />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <ChameleonMascot size="sm" mood="waving" />
        <Text style={styles.title}>{title}</Text>
      </View>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.form}>{children}</View>
      {footer}
    </AuthShell>
  );
}
