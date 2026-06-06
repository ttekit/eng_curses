import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import ContentHeader from "../../components/catalog/ContentHeader";
import PricingCards from "../../components/pricing/PricingCards";
import { useUser } from "../../context/UserContext";
import { usePricingCheckout } from "../../hooks/usePricingCheckout";
import { SEO } from "../../components/SEO/SEO";
import { resolveCanonicalUrl } from "../../lib/siteUrl";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { userMayUseLearnerApp } from "../../lib/subscriptionAccess";
import { buildMarketingHreflangAlternates } from "../../lib/seoHreflang";
import { buildPricingJsonLdSchemas } from "../../lib/seoStructuredData";
import { pricingFaqEn } from "../../lib/marketingSeoContent";
import { MarketingFaqSection } from "../../components/landing/MarketingFaqSection";
import { ArrowRight } from "lucide-react";

export default function PricingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useUser();
  const { startCheckout, checkoutLoading } = usePricingCheckout();
  const { messages, locale } = useLandingLocale();
  const pricingMeta = messages.pricingPage;
  const showPaywallLogout = Boolean(user && !userMayUseLearnerApp(user));

  const checkoutOk = searchParams.get("checkout") === "success";

  const heroSubtitle = useMemo(
    () => pricingMeta.heroSubtitle,
    [pricingMeta.heroSubtitle],
  );

  return (
    <div className="relative min-h-screen bg-background font-display text-foreground antialiased flex flex-col sm:block">
      <SEO
        title={pricingMeta.title}
        description={pricingMeta.description}
        canonicalUrl={resolveCanonicalUrl("/pricing")}
        ogLocale={locale === "uk" ? "uk_UA" : "en_US"}
        ogLocaleAlternate={locale === "uk" ? "en_US" : "uk_UA"}
        hreflangAlternates={buildMarketingHreflangAlternates("/pricing")}
        jsonLd={buildPricingJsonLdSchemas(locale)}
      />
      <ContentHeader variant="landing" />
      <div className="relative flex-1 flex sm:block items-center justify-center w-full">
        <div className="relative sm:fixed sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 z-40 flex flex-col text-center justify-center items-center">
          <div className="relative flex justify-center items-center mb-5 w-50 h-50">
            <div className="absolute w-40 h-40 rounded-full bg-linear-to-tr from-primary to-accent opacity-40 blur-2xl animate-pulse" />
            <img
              src="./ResultHappy.svg"
              className="relative z-10 w-full h-full"
              alt="Happy icon"
            />
          </div>
          <p className="text-4xl font-bold text-foreground mb-1">
            {pricingMeta.freeAccess}
          </p>
          <Link
            to="/registrationMain"
            className="hover:cursor-pointer inline-flex flex-row items-center text-center justify-center text-primary m-2 hover:bg-primary/20 rounded-md p-2 transition-all duration-300"
          >
            <span>{pricingMeta.startLearning}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        <main className="relative hidden sm:block mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8 lg:pt-32 opacity-20 pointer-events-none cursor-not-allowed select-none blur-[1px]">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
              {pricingMeta.title}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">{heroSubtitle}</p>
            {checkoutOk ? (
              <p
                className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200"
                role="status"
              >
                {pricingMeta.checkoutSuccess}
              </p>
            ) : null}
            {!isLoggedIn ? (
              <p className="mt-4 text-sm text-muted-foreground">
                <Link
                  to="/loginForm"
                  state={{ from: "/pricing" }}
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  {pricingMeta.signInPromptBefore}
                </Link>{" "}
                {pricingMeta.signInPromptAfter}
              </p>
            ) : null}
          </div>

          <PricingCards
            onSelectConsumerPlan={(id) =>
              void startCheckout(id, { isLoggedIn })
            }
            checkoutDisabled={checkoutLoading}
          />

          <p className="mx-auto mt-12 max-w-2xl text-center text-xs text-muted-foreground">
            {pricingMeta.stripeTerms}
          </p>

          {showPaywallLogout ? (
            <div className="mx-auto mt-10 flex justify-center border-border border-t pt-8">
              <button
                type="button"
                className="text-muted-foreground text-sm underline-offset-4 transition-colors hover:text-foreground hover:underline"
                onClick={() => {
                  logout();
                  navigate("/loginForm");
                }}
              >
                {messages.footer.links.logout}
              </button>
            </div>
          ) : null}

          <MarketingFaqSection
            id="pricing-faq"
            title={messages.marketingFaq.pricingTitle}
            subtitle={messages.marketingFaq.pricingSubtitle}
            items={pricingFaqEn}
            className="mt-16 border-t-0 bg-transparent py-0 sm:py-4"
          />
        </main>
      </div>
    </div>
  );
}
