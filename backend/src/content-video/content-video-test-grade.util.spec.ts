import {
  createGradingToken,
  parseGradingToken,
} from "./content-video-test-grade.util";

describe("parseGradingToken", () => {
  const secret = "test-secret-key";

  it("rejects expired tokens", () => {
    const token = createGradingToken(
      {
        exp: Date.now() - 1000,
        contentVideoId: 1,
        userId: 2,
        items: [
          {
            kind: "mcq",
            id: "q1",
            correctIndex: 0,
            category: "grammar",
            questionStem: "stem",
          },
        ],
      },
      secret,
    );
    expect(parseGradingToken(token, secret)).toBeNull();
  });

  it("accepts valid token and contentVideoId", () => {
    const token = createGradingToken(
      {
        exp: Date.now() + 60_000,
        contentVideoId: 5,
        userId: 9,
        items: [
          {
            kind: "mcq",
            id: "q1",
            correctIndex: 1,
            category: "comprehension",
            questionStem: "question one",
          },
        ],
      },
      secret,
    );
    const parsed = parseGradingToken(token, secret);
    expect(parsed?.contentVideoId).toBe(5);
    expect(parsed?.userId).toBe(9);
  });
});
