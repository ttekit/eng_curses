import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { ScreenContainer } from "../components/ScreenContainer";
import { AppButton } from "../components/AppButton";
import { PricingPlanCard } from "../components/PricingPlanCard";
import { useUser } from "../context/UserContext";
import { PRICING_PLANS } from "../lib/pricing_plans";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";

type Props = RootStackScreenProps<"Subscribe">;

export function SubscribeScreen({ navigation }: Props) {
  const { user, logout, refreshProfile } = useUser();

  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Subscription required</Text>
        <Text style={styles.body}>
          {user?.name ? `${user.name}, ` : ""}
          choose a plan to unlock lessons on mobile. Checkout opens on the Explys website;
          return here and pull to refresh your profile after subscribing.
        </Text>
        {PRICING_PLANS.filter((plan) => !plan.isContactSales).map((plan) => (
          <PricingPlanCard key={plan.id} plan={plan} />
        ))}
        <View style={styles.actions}>
          <AppButton
            label="I subscribed — refresh"
            onPress={() => {
              void refreshProfile().then(() => {
                navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] });
              });
            }}
          />
          <AppButton
            label="View all plans"
            variant="secondary"
            onPress={() => navigation.navigate("Pricing")}
          />
          <AppButton
            label="Sign out"
            variant="ghost"
            onPress={() => {
              void logout().then(() => {
                navigation.reset({ index: 0, routes: [{ name: "Login" }] });
              });
            }}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.screenPadding,
    gap: spacing.itemGap,
    paddingBottom: 40,
  },
  title: {
    ...typography.displayTitle,
    color: colors.text,
    fontSize: 28,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
});
