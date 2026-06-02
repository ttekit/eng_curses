import { LegalDocumentContent } from "../../components/landing/LegalDocumentContent";
import { StaticMarketingPageLayout } from "../../components/landing/StaticMarketingPageLayout";
import {
  termsOfServiceEn,
  termsOfServiceSeoEn,
} from "../../content/termsOfService.en";
import {
  termsOfServiceSeoUk,
  termsOfServiceUk,
} from "../../content/termsOfService.uk";
import { useLandingLocale } from "../../context/LandingLocaleContext";

export default function TermsOfServicePage() {
  const { locale } = useLandingLocale();
  const page = locale === "uk" ? termsOfServiceUk : termsOfServiceEn;
  const seo = locale === "uk" ? termsOfServiceSeoUk : termsOfServiceSeoEn;

  return (
    <StaticMarketingPageLayout
      title={seo.title}
      description={seo.description}
      path="/terms"
    >
      <LegalDocumentContent page={page} />
    </StaticMarketingPageLayout>
  );
}
