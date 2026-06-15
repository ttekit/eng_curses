import { ScrollView, StyleSheet, Text } from "react-native";
import { ScreenContainer } from "../components/ScreenContainer";
import { PricingPlanCard } from "../components/PricingPlanCard";
import { PRICING_PLANS } from "../lib/pricing_plans";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";


export function PricingScreen() {
  return (
    <ScreenContainer padded={false}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Choose your plan</Text>
        <Text style={styles.body}>
          Subscriptions are completed securely on the Explys website. Return to the app
          after checkout to start learning.
        </Text>
        {PRICING_PLANS.map((plan) => (
          <PricingPlanCard key={plan.id} plan={plan} />
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: spacing.screenPadding,
    gap: spacing.sectionGap,
    paddingBottom: 40,
  },
  title: {
    ...typography.displayTitle,
    color: colors.text,
  },
  body: {
    ...typography.body,
    color: colors.textMuted,
    lineHeight: 22,
  },
});
