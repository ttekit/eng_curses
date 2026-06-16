import { describe, expect, it } from "vitest";
import {
  learnerHasCompletedCustomise,
  shouldShowLearnerCustomiseFab,
} from "./learnerCustomise";
import type { UserData } from "../context/UserContext";

function baseUser(overrides: Partial<UserData> = {}): UserData {
  return {
    id: 1,
    email: "learner@example.com",
    role: "adult",
    workField: "",
    education: "",
    hobbies: [],
    favoriteGenres: [],
    hatedGenres: [],
    teacherId: null,
    ...overrides,
  } as UserData;
}

describe("learnerHasCompletedCustomise", () => {
  it("returns false when profile fields are incomplete", () => {
    expect(learnerHasCompletedCustomise(baseUser())).toBe(false);
    expect(
      learnerHasCompletedCustomise(
        baseUser({ workField: "IT", education: "bachelor" }),
      ),
    ).toBe(false);
  });

  it("returns true when job, education, hobbies, and genres are set", () => {
    expect(
      learnerHasCompletedCustomise(
        baseUser({
          workField: "IT",
          education: "bachelor",
          hobbies: ["reading"],
          favoriteGenres: [1],
        }),
      ),
    ).toBe(true);
  });

  it("treats choose placeholder as empty", () => {
    expect(
      learnerHasCompletedCustomise(
        baseUser({
          workField: "choose",
          education: "bachelor",
          hobbies: ["reading"],
          favoriteGenres: [1],
        }),
      ),
    ).toBe(false);
  });
});

describe("shouldShowLearnerCustomiseFab", () => {
  it("hides for teachers, completed profiles, and on customise page", () => {
    const incomplete = baseUser({ workField: "IT" });
    expect(shouldShowLearnerCustomiseFab(incomplete, "/catalog")).toBe(true);
    expect(shouldShowLearnerCustomiseFab(incomplete, "/customise")).toBe(false);
    expect(
      shouldShowLearnerCustomiseFab(
        baseUser({ role: "teacher" }),
        "/catalog",
      ),
    ).toBe(false);
    expect(
      shouldShowLearnerCustomiseFab(
        baseUser({
          workField: "IT",
          education: "bachelor",
          hobbies: ["reading"],
          favoriteGenres: [1],
        }),
        "/catalog",
      ),
    ).toBe(false);
  });
});
