import { StyleSheet, Text, View, Linking } from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AppButton } from "../components/AppButton";
import { useUser } from "../context/UserContext";
import { colors } from "../theme/colors";

type Props = RootStackScreenProps<"Subscribe">;

export function SubscribeScreen({ navigation }: Props) {
  const { user, logout } = useUser();

  const openPricing = () => {
    void Linking.openURL("https://explys.com/pricing");
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Subscription required</Text>
      <Text style={styles.body}>
        {user?.name ? `${user.name}, ` : ""}
        an active Explys plan is needed to access lessons on mobile. Subscribe on
        the web, then return here and refresh your session.
      </Text>

      <View style={styles.actions}>
        <AppButton label="View plans" onPress={openPricing} />
        <AppButton
          label="Back to catalog"
          variant="ghost"
          onPress={() => {
            navigation.reset({
              index: 0,
              routes: [{ name: "MainTabs" }],
            });
          }}
        />
        <AppButton
          label="Sign out"
          variant="ghost"
          onPress={() => {
            void logout().then(() => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            });
          }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 12,
  },
  body: {
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 28,
  },
  actions: {
    gap: 12,
  },
});
