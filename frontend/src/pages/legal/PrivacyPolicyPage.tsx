import { LegalDocumentContent } from "../../components/landing/LegalDocumentContent";
import { StaticMarketingPageLayout } from "../../components/landing/StaticMarketingPageLayout";
import {
  privacyPolicyEn,
  privacyPolicySeo,
} from "../../content/privacyPolicy.en";

export default function PrivacyPolicyPage() {
  return (
    <StaticMarketingPageLayout
      title={privacyPolicySeo.title}
      description={privacyPolicySeo.description}
      path="/privacy"
    >
      <LegalDocumentContent page={privacyPolicyEn} />
    </StaticMarketingPageLayout>
  );
}
