import {
  dedupeSanitizedVocabularyTerms,
  sanitizeVocabularyTerm,
} from "./vocabulary-term-sanitize.util";

describe("sanitizeVocabularyTerm", () => {
  it("maps contractions to usual headwords", () => {
    expect(sanitizeVocabularyTerm("I'm")).toBe("be");
    expect(sanitizeVocabularyTerm("don't")).toBe("do");
    expect(sanitizeVocabularyTerm("brothers")).toBe("brother");
  });

  it("keeps ordinary lowercase words", () => {
    expect(sanitizeVocabularyTerm("little")).toBe("little");
    expect(sanitizeVocabularyTerm("brother")).toBe("brother");
  });

  it("drops probable proper nouns and names", () => {
    expect(sanitizeVocabularyTerm("Peppa")).toBeNull();
    expect(sanitizeVocabularyTerm("George")).toBeNull();
    expect(sanitizeVocabularyTerm("Pig")).toBeNull();
    expect(sanitizeVocabularyTerm("Peppa Pig")).toBeNull();
  });
});

describe("dedupeSanitizedVocabularyTerms", () => {
  it("dedupes after normalization", () => {
    expect(
      dedupeSanitizedVocabularyTerms(["I'm", "am", "Peppa", "brothers"]),
    ).toEqual(["be", "brother"]);
  });
});
