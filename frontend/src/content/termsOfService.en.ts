import type { LegalPageContent } from "../components/landing/LegalDocumentContent";

export const termsOfServiceSeoEn = {
  title: "Terms of service",
  description: "Terms and conditions for using the Explys platform.",
} as const;

/**
 * Explys Terms of Service — English.
 */
export const termsOfServiceEn: LegalPageContent = {
  title: "Explys Platform Terms of Service",
  lead: "This Terms of Service agreement (the \"Agreement\") is a legally binding contract between you (\"User\", \"Learner\", \"Teacher\", or \"You\") and the limited liability company operating under the Explys brand (\"Company\", \"We\", \"Explys\"), governing use of the educational platform, the explys.com website, mobile applications, personalized learning algorithms, the media library, and any related services (collectively, the \"Service\" or \"Platform\"). By registering an account, taking a placement test, purchasing a subscription, or otherwise using the Service, you confirm that you have read, understood, and agree to comply with all terms of this Agreement. If you do not agree, you must stop using the Platform immediately.",
  lastUpdated: "Effective date: May 31, 2026",
  sections: [
    {
      heading: "1. Description of the Service and account types",
      subsections: [
        {
          heading: "1.1. Nature of the Platform",
          paragraphs: [
            "Explys is a technology platform for learning English that uses dynamic personalization, audiovisual learning, and generative artificial intelligence to build individual learning plans.",
          ],
        },
        {
          heading: "1.2. User roles",
          paragraphs: ["The Platform provides several access levels:"],
          bullets: [
            "Adult user (Adult B2C): An individual who registers independently and has full access to the media library, placement testing, and algorithmic planning.",
            "Teacher (Teacher B2B/B2G): A verified representative of an educational institution or a corporate instructor. A Teacher may create virtual classes, generate credentials for Learners, manage learning topics, assign tasks, and initiate testing.",
            "Learner (Pupil/Student): A user whose account was created by a Teacher. Learners' access to the media library is strictly moderated with age restrictions applied.",
          ],
        },
        {
          heading: "1.3. Age restrictions",
          paragraphs: [
            "Use of the Service by persons who have not reached the age of majority in their jurisdiction is permitted only through a Learner account created by an authorized Teacher. Self-registration as an Adult user requires the age of legal capacity.",
          ],
        },
      ],
    },
    {
      heading: "2. License grant and use restrictions",
      subsections: [
        {
          heading: "2.1. Limited license",
          paragraphs: [
            "Subject to your compliance with this Agreement and timely payment of applicable fees, Explys grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Platform solely for your personal, non-commercial educational purposes (or for your institution's educational purposes in the case of Teachers).",
          ],
        },
        {
          heading: "2.2. Intellectual property protection",
          paragraphs: [
            "All Platform architecture — including software code, knowledge-level graphics, algorithms, databases, visual elements (including mascot design), testing methodologies, and generated learning plans — is the exclusive property of Explys. These works were created by the development team and gig specialists, and ownership transferred to the Company upon creation in accordance with the Law of Ukraine \"On Stimulating the Development of the Digital Economy in Ukraine\" (Diia City Law).",
          ],
        },
        {
          heading: "2.3. Prohibited conduct",
          paragraphs: ["You are strictly prohibited from:"],
          bullets: [
            "Copying, distributing, modifying, decompiling, or reverse-engineering the Platform.",
            "Using automated tools such as spiders, robots, or data-mining methods to catalog, download, or reproduce Platform content.",
            "Using the Platform to train your own artificial intelligence models based on Explys algorithms or content.",
            "Transferring, selling, or renting access to your account (including logins and passwords from spreadsheets downloaded by Teachers).",
          ],
        },
      ],
    },
    {
      heading: "3. Audiovisual content and third-party integrations",
      subsections: [
        {
          heading: "3.1. Content structure",
          paragraphs: [
            "The Platform uses video content from several sources: film excerpts streamed from Explys servers; materials integrated via the YouTube API; and AI-generated content.",
          ],
        },
        {
          heading: "3.2. Educational use",
          paragraphs: [
            "Film excerpts are used by Explys solely as illustrations for learning. This use is protected and carried out under Article 21 of the Law of Ukraine \"On Copyright and Related Rights\", which permits use of lawfully published works as illustrations for teaching purposes. For users and educational institutions in the European Union, use of content in digital and cross-border educational activities through a closed electronic environment is governed by Article 5 of Directive (EU) 2019/790 (DSM Directive).",
          ],
        },
        {
          heading: "3.3. Third-party platforms",
          paragraphs: [
            "Your use of video materials streamed through YouTube is governed by the YouTube Terms of Service and Google's Privacy Policy.",
          ],
        },
      ],
    },
    {
      heading: "4. Generative artificial intelligence and disclaimer",
      subsections: [
        {
          heading: "4.1. Algorithmic profiling",
          paragraphs: [
            "Placement tests, knowledge-level charts, and goal-achievement probability are generated using automated algorithms and depend on the accuracy of data you provide.",
          ],
        },
        {
          heading: "4.2. Use of Gemini AI",
          paragraphs: [
            "The Platform uses large language models (including Gemini AI technologies) to evaluate your answers to open questions, explain grammar errors, and generate subtitles.",
          ],
        },
        {
          heading: "4.3. No warranty of AI accuracy",
          paragraphs: [
            "Generative artificial intelligence is an evolving technology. Explys does not guarantee the completeness, truthfulness, absolute accuracy, or reliability of AI features or generated responses. You assume all risk associated with using generative AI features. All materials are provided for educational purposes only.",
          ],
        },
      ],
    },
    {
      heading: "5. Subscriptions, plans, and payment",
      subsections: [
        {
          heading: "5.1. Plans",
          paragraphs: [
            "Explys offers differentiated plans (Light, Smart, Family, Teacher). Prices and available features for each plan are shown on the checkout page.",
          ],
        },
        {
          heading: "5.2. Automatic renewal",
          paragraphs: [
            "If you purchase a subscription, it will automatically renew at the end of each billing period at the then-current price unless you disable auto-renewal in your account settings before the current period ends.",
          ],
        },
        {
          heading: "5.3. Refunds",
          paragraphs: [
            "Subscription payments are non-refundable except where required by consumer protection law. If you cancel early, no refund is issued for unused time.",
          ],
        },
      ],
    },
    {
      heading: "6. Special terms for Teachers and educational institutions",
      subsections: [
        {
          heading: "6.1. Agent status",
          paragraphs: [
            "By creating accounts for Learners (minors) and generating logins/passwords, a Teacher acts as a lawful representative and agent of the educational institution.",
          ],
        },
        {
          heading: "6.2. Parental consent (COPPA/GDPR)",
          paragraphs: [
            "Although laws such as the U.S. Children's Online Privacy Protection Act (COPPA) do not apply directly to schools, third parties such as Explys must comply when collecting data. A Teacher or school may provide consent on behalf of parents for platform use solely for educational purposes. The Teacher warrants that the institution has obtained verifiable parental consent as required.",
          ],
        },
      ],
    },
    {
      heading: "7. Gamification and virtual assets",
      subsections: [
        {
          heading: "7.1. Virtual economy",
          paragraphs: [
            "To improve retention, the Service uses game mechanics (levels, experience points, mascot customization items, and the \"Streak\" feature).",
          ],
        },
        {
          heading: "7.2. No real-world value",
          paragraphs: [
            "All virtual items and activity counters are digital content only. They have no monetary or property value, cannot be converted to real money, sold, or transferred to third parties.",
          ],
        },
      ],
    },
    {
      heading: "8. User content and learning telemetry",
      paragraphs: [
        "You retain rights to your text answers and test results, but grant Explys a perpetual, worldwide, royalty-free license to use, analyze, and modify that data to generate individual lesson summaries, update topic knowledge, and improve Platform algorithms. You may not submit text containing profanity or third parties' personal data.",
      ],
    },
    {
      heading: "9. Changes and termination",
      subsections: [
        {
          heading: "9.1. Right to suspend",
          paragraphs: [
            "Explys may, at its sole discretion, suspend or block your account at any time without prior notice if you violate this Agreement.",
          ],
        },
        {
          heading: "9.2. Updates to terms",
          paragraphs: [
            "We may amend this Agreement. Continued use of the Service after changes are published constitutes your unconditional acceptance of the updated Terms.",
          ],
        },
      ],
    },
    {
      heading: "10. Governing law and dispute resolution",
      paragraphs: [
        "This Agreement is governed by and construed in accordance with the laws of Ukraine, including special legislation on the Diia City legal regime, without regard to conflict-of-law principles. Any disputes shall be resolved in the competent courts at the Company's registered office, unless mandatory consumer protection rules in the User's jurisdiction provide otherwise.",
      ],
    },
  ],
};
