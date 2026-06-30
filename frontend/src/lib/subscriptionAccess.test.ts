import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { UserData } from "../context/UserContext";
import {
  userExemptFromSubscription,
  userHasPaidSubscription,
  userMayUseLearnerApp,
} from "./subscriptionAccess";

function mockUser(partial: Partial<UserData>): UserData {
  return {
    id: "1",
    name: "Test",
    email: "t@example.com",
    dateOfBirth: "",
    createdAt: "",
    role: "adult",
    isVerified: true,
    isTwoFactorEnable: false,
    hasCompletedPlacement: true,
    englishLevel: "B1",
    hobbies: [],
    education: "",
    workField: "",
    nativeLanguage: "",
    favoriteGenres: [],
    hatedGenres: [],
    currentStreak: 0,
    xp: 0,
    level: 1,
    achievements: [],
    ...partial,
  };
}

describe("userMayUseLearnerApp", () => {
  beforeEach(() => {
    vi.stubEnv("VITE_APP_SUBSCRIPTION_DEV_MODE", "0");
    vi.stubEnv("VITE_SKIP_SUBSCRIPTION_ENFORCEMENT", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("denies adult without paid subscription", () => {
    const user = mockUser({
      role: "adult",
      subscriptionStatus: "canceled",
    });
    expect(userMayUseLearnerApp(user)).toBe(false);
  });

  it("allows adult with active subscription", () => {
    const user = mockUser({
      role: "adult",
      subscriptionStatus: "active",
    });
    expect(userMayUseLearnerApp(user)).toBe(true);
  });

  it("denies independent student without subscription", () => {
    const user = mockUser({
      role: "student",
      teacherId: null,
      subscriptionStatus: undefined,
    });
    expect(userMayUseLearnerApp(user)).toBe(false);
  });

  it("allows roster student via teacherId", () => {
    const user = mockUser({
      role: "student",
      teacherId: 42,
      subscriptionStatus: undefined,
    });
    expect(userExemptFromSubscription(user)).toBe(true);
    expect(userMayUseLearnerApp(user)).toBe(true);
  });

  it("allows teacher and admin", () => {
    expect(userMayUseLearnerApp(mockUser({ role: "teacher" }))).toBe(true);
    expect(userMayUseLearnerApp(mockUser({ role: "admin" }))).toBe(true);
  });
});

describe("userHasPaidSubscription", () => {
  it("accepts active and trialing", () => {
    expect(
      userHasPaidSubscription(mockUser({ subscriptionStatus: "active" })),
    ).toBe(true);
    expect(
      userHasPaidSubscription(mockUser({ subscriptionStatus: "trialing" })),
    ).toBe(true);
  });
});
