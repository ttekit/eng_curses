export type LegalSlug = "about" | "privacy" | "terms" | "feedback";

type LegalDocument = {
  title: string;
  summary: string;
  webUrl: string;
};

export const LEGAL_DOCUMENTS: Record<LegalSlug, LegalDocument> = {
  about: {
    title: "About Explys",
    summary:
      "Explys is an adaptive English learning platform with video lessons, quizzes, and personalized study plans.",
    webUrl: "https://explys.com/about",
  },
  privacy: {
    title: "Privacy Policy",
    summary:
      "Learn how Explys collects, uses, and protects your personal data when you use our services.",
    webUrl: "https://explys.com/privacy",
  },
  terms: {
    title: "Terms of Service",
    summary:
      "Read the terms that govern your use of the Explys platform and subscription services.",
    webUrl: "https://explys.com/terms",
  },
  feedback: {
    title: "Feedback",
    summary:
      "Share product feedback or report issues so we can improve the learner experience.",
    webUrl: "https://explys.com/feedback",
  },
};
