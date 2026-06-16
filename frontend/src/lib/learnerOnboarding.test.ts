import { describe, expect, it } from "vitest";
import type { UserData } from "../context/UserContext";
import {
  learnerNeedsPlacement,
  learnerNeedsRoleSelection,
  resolvePlacementPhase,
  resolvePostLoginPath,
  resolveRegistrationCompletionPath,
} from "./learnerOnboarding";

function mockUser(partial: Partial<UserData>): UserData {
  return {
    id: "1",
    name: "Test",
    email: "t@example.com",
    dateOfBirth: "",
    role: "adult",
    isVerified: true,
    isTwoFactorEnable: false,
    hasCompletedPlacement: false,
    englishLevel: "B1",
    hobbies: ["reading"],
    education: "uni",
    workField: "it",
    nativeLanguage: "uk",
    favoriteGenres: [1],
    hatedGenres: [],
    currentStreak: 0,
    xp: 0,
    level: 1,
    achievements: [],
    ...partial,
  };
}

describe("resolvePostLoginPath", () => {
  it("sends incomplete adult to catalog for placement", () => {
    const path = resolvePostLoginPath(
      mockUser({ role: "adult", hasCompletedPlacement: false }),
    );
    expect(path).toBe("/catalog");
  });

  it("sends teacher-linked student without subscription to catalog when placement done", () => {
    const path = resolvePostLoginPath(
      mockUser({
        role: "student",
        teacherId: 9,
        hasCompletedPlacement: true,
        subscriptionStatus: undefined,
      }),
    );
    expect(path).toBe("/catalog");
  });

  it("sends student without genres to catalog", () => {
    const path = resolvePostLoginPath(
      mockUser({
        role: "student",
        teacherId: null,
        favoriteGenres: [],
        hatedGenres: [],
        hasCompletedPlacement: true,
      }),
    );
    expect(path).toBe("/catalog");
  });
});

describe("resolvePlacementPhase", () => {
  it("returns off when placement complete", () => {
    expect(
      resolvePlacementPhase(
        mockUser({ hasCompletedPlacement: true }),
      ),
    ).toBe("off");
  });

  it("returns preferences for adult missing CEFR only", () => {
    expect(
      resolvePlacementPhase(
        mockUser({
          role: "adult",
          englishLevel: "",
          workField: "engineer",
          hasCompletedPlacement: false,
        }),
      ),
    ).toBe("preferences");
  });

  it("returns test for adult with CEFR set", () => {
    expect(
      resolvePlacementPhase(
        mockUser({
          role: "adult",
          englishLevel: "B1",
          workField: "",
          hasCompletedPlacement: false,
        }),
      ),
    ).toBe("test");
  });

  it("returns test for roster student without profile fields", () => {
    expect(
      resolvePlacementPhase(
        mockUser({
          role: "student",
          teacherId: 1,
          hasCompletedPlacement: false,
          hobbies: [],
          favoriteGenres: [],
        }),
      ),
    ).toBe("test");
  });
});

describe("learnerNeedsPlacement", () => {
  it("is false for admin", () => {
    expect(learnerNeedsPlacement(mockUser({ role: "admin" }))).toBe(false);
  });
});

describe("learnerNeedsRoleSelection", () => {
  it("is true for regular and choose roles", () => {
    expect(learnerNeedsRoleSelection("regular")).toBe(true);
    expect(learnerNeedsRoleSelection("choose")).toBe(true);
    expect(learnerNeedsRoleSelection("")).toBe(true);
  });

  it("is false for completed roles", () => {
    expect(learnerNeedsRoleSelection("adult")).toBe(false);
    expect(learnerNeedsRoleSelection("student")).toBe(false);
  });
});

describe("resolveRegistrationCompletionPath", () => {
  it("sends incomplete role back to step 2", () => {
    expect(
      resolveRegistrationCompletionPath(mockUser({ role: "regular" })),
    ).toBe("/registrationDetails");
  });

  it("sends completed learner to catalog", () => {
    expect(
      resolveRegistrationCompletionPath(mockUser({ role: "adult" })),
    ).toBe("/catalog");
  });
});
