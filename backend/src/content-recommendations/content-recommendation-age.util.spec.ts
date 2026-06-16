import {
  isUserEligibleForVideoAge,
  parseVideoMinAgeYears,
  resolveUserAgeYears,
} from "./content-recommendation-age.util";
import { UserRole } from "@generated/prisma/enums";

describe("content-recommendation-age.util", () => {
  describe("parseVideoMinAgeYears", () => {
    it("parses restriction labels", () => {
      expect(parseVideoMinAgeYears("16+")).toBe(16);
      expect(parseVideoMinAgeYears("18+")).toBe(18);
      expect(parseVideoMinAgeYears(undefined)).toBe(0);
    });
  });

  describe("resolveUserAgeYears", () => {
    it("treats adult role as 18+", () => {
      expect(
        resolveUserAgeYears({ dateOfBirth: null, role: UserRole.ADULT }),
      ).toBe(18);
    });

    it("computes age from date of birth", () => {
      const dob = new Date();
      dob.setFullYear(dob.getFullYear() - 15);
      expect(
        resolveUserAgeYears({ dateOfBirth: dob, role: UserRole.STUDENT }),
      ).toBe(15);
    });
  });

  describe("isUserEligibleForVideoAge", () => {
    it("blocks underage users from restricted films", () => {
      expect(isUserEligibleForVideoAge(15, "16+")).toBe(false);
      expect(isUserEligibleForVideoAge(16, "16+")).toBe(true);
      expect(isUserEligibleForVideoAge(17, "18+")).toBe(false);
    });

    it("blocks unknown age for restricted films", () => {
      expect(isUserEligibleForVideoAge(null, "12+")).toBe(false);
      expect(isUserEligibleForVideoAge(null, "0+")).toBe(true);
    });
  });
});
