/**
 * Learner profile inputs used to personalise studying-plan generation.
 */
export type StudyingPlanLearnerProfile = {
  learningGoal: string;
  timeHorizon: string;
  englishLevel: string;
  job: string | null;
  workField: string | null;
  education: string | null;
  hobbies: string[];
  tagNames: string[];
};

/**
 * Formats learner profile for Gemini prompts.
 */
export function formatLearnerProfileForPrompt(
  profile: StudyingPlanLearnerProfile,
): string {
  const lines = [
    `Learning goal: ${profile.learningGoal}`,
    `Time horizon: ${profile.timeHorizon}`,
    `Current English level: ${profile.englishLevel}`,
    `Job / role: ${profile.job?.trim() || profile.workField?.trim() || "(not specified)"}`,
    `Education: ${profile.education?.trim() || "(not specified)"}`,
    `Hobbies: ${profile.hobbies.length > 0 ? profile.hobbies.join(", ") : "(none)"}`,
    `Relevant tags: ${profile.tagNames.length > 0 ? profile.tagNames.slice(0, 40).join(", ") : "(none)"}`,
  ];
  return lines.join("\n");
}
