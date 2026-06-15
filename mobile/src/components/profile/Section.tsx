import { Text, View } from "react-native";
import { profileScreenStyles as styles } from "../../screens/profile_screen_styles";

type SectionProps = {
  label: string;
  value: string;
};

export function Section({ label, value }: SectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <Text style={styles.sectionValue}>{value}</Text>
    </View>
  );
}
