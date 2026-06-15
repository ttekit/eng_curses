import { ActivityIndicator, View } from "react-native";
import { colors } from "../theme/colors";
import { layoutStyles } from "../theme/layout_styles";

export function LoadingCenter() {
  return (
    <View style={layoutStyles.center}>
      <ActivityIndicator color={colors.primary} size="large" />
    </View>
  );
}
