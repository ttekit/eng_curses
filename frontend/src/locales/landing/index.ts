import { appEn } from "../app/en";
import { appUk } from "../app/uk";
import { landingEn } from "./en";
import { landingUk } from "./uk";

export type LandingLocaleId = "en" | "uk";

type AppLearningMessages = Pick<
  typeof appEn,
  "learningPlan" | "learningPlanPhases"
>;

/** Marketing/landing copy plus app strings used on shared routes (e.g. learning plan). */
export type LandingMessages = typeof landingEn & AppLearningMessages;

/** Runtime check: Ukrainian landing bundle matches English shape. */
const _landingBundleShape: typeof landingEn = landingUk as unknown as typeof landingEn;
void _landingBundleShape;

export const LANDING_LOCALES: Record<LandingLocaleId, typeof landingEn> = {
  en: landingEn,
  uk: landingUk,
};

const APP_LEARNING: Record<LandingLocaleId, AppLearningMessages> = {
  en: {
    learningPlan: appEn.learningPlan,
    learningPlanPhases: appEn.learningPlanPhases,
  },
  uk: {
    learningPlan: appUk.learningPlan,
    learningPlanPhases: appUk.learningPlanPhases,
  },
};

export function getLandingMessages(locale: LandingLocaleId): LandingMessages {
  return { ...LANDING_LOCALES[locale], ...APP_LEARNING[locale] };
}

export { landingEn, landingUk };

/** @deprecated Use LandingMessages from en/uk */
export type LandingLocale = LandingMessages;
