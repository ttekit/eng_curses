import { Image, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { fontFamilies, typography } from "../theme/typography";

type BrandLogoProps = {
  compact?: boolean;
  style?: ViewStyle;
};

export function BrandLogo({ compact = false, style }: BrandLogoProps) {
  return (
    <View style={[styles.row, style]}>
      <Image
        source={require("../../assets/icon.png")}
        style={compact ? styles.iconCompact : styles.icon}
        resizeMode="contain"
      />
      <Text style={compact ? styles.nameCompact : styles.name}>Explys</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  icon: {
    width: 40,
    height: 48,
  },
  iconCompact: {
    width: 28,
    height: 34,
  },
  name: {
    fontFamily: fontFamilies.display,
    fontSize: 24,
    color: colors.text,
  },
  nameCompact: {
    fontFamily: fontFamilies.display,
    fontSize: 16,
    color: colors.text,
  },
});
