import { Pressable, Text } from "react-native";
import { profileScreenStyles as styles } from "../../screens/profile_screen_styles";

type LinkRowProps = {
  label: string;
  onPress: () => void;
};

export function LinkRow({ label, onPress }: LinkRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.linkRow}>
      <Text style={styles.linkText}>{label}</Text>
    </Pressable>
  );
}
