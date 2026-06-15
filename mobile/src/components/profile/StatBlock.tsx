import { Text, View } from "react-native";
import { profileScreenStyles as styles } from "../../screens/profile_screen_styles";

type StatBlockProps = {
  label: string;
  value: string;
};

export function StatBlock({ label, value }: StatBlockProps) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
