import { LegalDocumentContent } from "../../components/landing/LegalDocumentContent";
import { StaticMarketingPageLayout } from "../../components/landing/StaticMarketingPageLayout";
import { useLandingLocale } from "../../context/LandingLocaleContext";

export default function AboutPage() {
  const { messages } = useLandingLocale();
  const page = messages.aboutPage;

  return (
    <StaticMarketingPageLayout
      title={page.seoTitle}
      description={page.seoDescription}
      path="/about"
    >
      <LegalDocumentContent page={page} />
    </StaticMarketingPageLayout>
  );
}
