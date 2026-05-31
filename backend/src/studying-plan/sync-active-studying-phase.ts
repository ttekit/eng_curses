import { PrismaService } from "src/prisma.service";
import {
  activeStudyingPhaseIndexFromProgress,
  phaseCountFromStoredPhases,
} from "../content-video/studying-plan-phase-progress.util";
import { parsePhaseFinalTestProgress } from "../phase-final-test/phase-final-test-progress.util";

/**
 * Recompute `activeStudyingPhaseIndex` from distinct passed comprehension videos
 * and passed phase final tests.
 */
export async function syncActiveStudyingPhaseForUser(
  prisma: PrismaService,
  userId: number,
): Promise<void> {
  const passedRows = await prisma.comprehensionTestAttempt.findMany({
    where: { userId, passed: true },
    distinct: ["contentVideoId"],
    select: { contentVideoId: true },
  });
  const extra = await prisma.additionalUserData.findUnique({
    where: { userId },
    select: {
      studyingPlanPhases: true,
      phaseFinalTestProgress: true,
    },
  });
  const phaseCount = phaseCountFromStoredPhases(extra?.studyingPlanPhases, 4);
  const progress = parsePhaseFinalTestProgress(extra?.phaseFinalTestProgress);
  const idx = activeStudyingPhaseIndexFromProgress({
    distinctPassedLessonCount: passedRows.length,
    passedFinalTestPhaseIndices: progress.passedPhaseIndices,
    phaseCount,
  });
  await prisma.additionalUserData.updateMany({
    where: { userId },
    data: { activeStudyingPhaseIndex: idx },
  });
}
