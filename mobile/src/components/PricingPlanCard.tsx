import { Linking, StyleSheet, Text, View } from "react-native";
import type { PricingPlan } from "../lib/pricing_plans";
import { build_pricing_checkout_url } from "../lib/pricing_plans";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { AppButton } from "./AppButton";

type PricingPlanCardProps = {
  plan: PricingPlan;
};

export function PricingPlanCard({ plan }: PricingPlanCardProps) {
  const openCheckout = () => {
    if (plan.isContactSales) {
      void Linking.openURL("https://explys.com/feedback");
      return;
    }
    void Linking.openURL(build_pricing_checkout_url(plan.id));
  };

  return (
    <View style={[styles.card, plan.isPopular ? styles.cardPopular : null]}>
      {plan.isPopular ? <Text style={styles.badge}>Most popular</Text> : null}
      <Text style={styles.name}>{plan.name}</Text>
      <Text style={styles.description}>{plan.description}</Text>
      <Text style={styles.price}>
        {plan.priceLabel}
        {plan.billingNote ? (
          <Text style={styles.billing}> / {plan.billingNote}</Text>
        ) : null}
      </Text>
      <View style={styles.features}>
        {plan.features.map((feature) => (
          <Text key={feature} style={styles.feature}>
            • {feature}
          </Text>
        ))}
      </View>
      <AppButton
        label={plan.ctaLabel}
        variant={plan.isPopular ? "primary" : "secondary"}
        onPress={openCheckout}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: spacing.cardRadius,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 16,
    gap: 10,
  },
  cardPopular: {
    borderColor: colors.primary,
  },
  badge: {
    ...typography.caption,
    fontFamily: typography.bodySemiBold.fontFamily,
    color: colors.primary,
  },
  name: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 18,
  },
  description: {
    ...typography.caption,
    color: colors.textMuted,
  },
  price: {
    ...typography.bodySemiBold,
    color: colors.text,
    fontSize: 22,
  },
  billing: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 14,
  },
  features: {
    gap: 4,
    marginBottom: 4,
  },
  feature: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
