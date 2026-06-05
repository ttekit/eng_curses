import { SafeAreaView, StyleSheet, type ViewProps } from "react-native";
import { colors } from "../theme/colors";

type ScreenContainerProps = ViewProps & {
  padded?: boolean;
};

export function ScreenContainer({
  children,
  padded = true,
  style,
  ...rest
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.root, padded ? styles.padded : null, style]} {...rest}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  padded: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});
