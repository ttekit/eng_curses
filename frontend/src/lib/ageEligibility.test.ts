import { describe, expect, it } from "vitest";
import type { UserData } from "../context/UserContext";
import {
  isUserEligibleForVideoAge,
  parseVideoMinAgeYears,
  resolveVideoAgeAccess,
} from "./ageEligibility";

function mockUser(partial: Partial<UserData>): UserData {
  return {
    id: "1",
    name: "Test",
    email: "t@example.com",
    dateOfBirth: "",
    createdAt: "",
    role: "student",
    isVerified: true,
    isTwoFactorEnable: false,
    hasCompletedPlacement: false,
    englishLevel: "B1",
    hobbies: [],
    education: "",
    workField: "",
    nativeLanguage: "uk",
    favoriteGenres: [],
    hatedGenres: [],
    currentStreak: 0,
    xp: 0,
    level: 1,
    achievements: [],
    ...partial,
  };
}

describe("parseVideoMinAgeYears", () => {
  it("parses restriction labels", () => {
    expect(parseVideoMinAgeYears("16+")).toBe(16);
    expect(parseVideoMinAgeYears("0+")).toBe(0);
  });
});

describe("resolveVideoAgeAccess", () => {
  it("allows unrestricted videos without DOB", () => {
    expect(resolveVideoAgeAccess(mockUser({}), "0+")).toBe("allowed");
  });

  it("requires DOB for restricted videos", () => {
    expect(resolveVideoAgeAccess(mockUser({ dateOfBirth: "" }), "12+")).toBe(
      "needs_dob",
    );
  });

  it("blocks underage learners", () => {
    expect(
      resolveVideoAgeAccess(
        mockUser({ dateOfBirth: "2020-01-01" }),
        "18+",
      ),
    ).toBe("blocked");
  });

  it("allows eligible learners", () => {
    expect(
      resolveVideoAgeAccess(
        mockUser({ dateOfBirth: "1990-06-01" }),
        "18+",
      ),
    ).toBe("allowed");
  });

  it("allows teachers regardless of DOB", () => {
    expect(
      resolveVideoAgeAccess(
        mockUser({ role: "teacher", dateOfBirth: "" }),
        "18+",
      ),
    ).toBe("allowed");
  });
});

describe("isUserEligibleForVideoAge", () => {
  it("matches resolveVideoAgeAccess allowed state", () => {
    expect(
      isUserEligibleForVideoAge(mockUser({ dateOfBirth: "1990-01-01" }), "16+"),
    ).toBe(true);
  });
});
