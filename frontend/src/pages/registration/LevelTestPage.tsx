import { useState } from "react";
import { useNavigate } from "react-router";
import ContentHeader from "../../components/catalog/ContentHeader";
import { SEO } from "../../components/SEO/SEO";
import { resolveCanonicalUrl } from "../../lib/siteUrl";
import { useAppMessages } from "../../hooks/useAppMessages";
import { formatMessage } from "../../lib/formatMessage";
import { useUser } from "../../context/UserContext";

const questions = [
  {
    text: "I ___ a student.",
    options: ["am", "is", "are", "be"],
    correctAnswer: "am",
  },
  {
    text: "She ___ to the gym every morning.",
    options: ["go", "goes", "going", "gone"],
    correctAnswer: "goes",
  },
  {
    text: "I have never ___ to New York.",
    options: ["be", "was", "been", "being"],
    correctAnswer: "been",
  },
  {
    text: "If I had more time, I ___ travel the world.",
    options: ["will", "would", "can", "shall"],
    correctAnswer: "would",
  },
  {
    text: "By this time next year, I ___ my university degree.",
    options: ["will finish", "will have finished", "finished", "finish"],
    correctAnswer: "will have finished",
  },
];

export default function LevelTestPage() {
  const navigate = useNavigate();
  const { refreshProfile } = useUser();
  const levelTest = useAppMessages().levelTestPage;
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleAnswer = (selectedOption: string) => {
    if (selectedOption === questions[currentQuestion].correctAnswer) {
      setScore(score + 1);
    }

    const nextQuestion = currentQuestion + 1;
    if (nextQuestion < questions.length) {
      setCurrentQuestion(nextQuestion);
    } else {
      setShowResult(true);
    }
  };

  const getEnglishLevel = () => {
    if (score === 0 || score === 1) return levelTest.levels.a1;
    if (score === 2) return levelTest.levels.a2;
    if (score === 3) return levelTest.levels.b1;
    if (score === 4) return levelTest.levels.b2;
    return levelTest.levels.c1;
  };

  return (
    <div className="relative min-h-screen font-display bg-background flex flex-col items-center justify-center p-5">
      <SEO
        title={levelTest.seoTitle}
        description={levelTest.seoDescription}
        canonicalUrl={resolveCanonicalUrl("/level-test")}
        noindex
      />
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.59_0.16_165/_40%)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.65_0.25_295/_20%)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-card/60" />
      <ContentHeader />
      <div className="max-w-2xl z-10 w-full bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-lg">
        {!showResult ? (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center mb-2">
              <h1 className="text-2xl font-bold text-foreground/70">
                {levelTest.title}
              </h1>
              <span className="text-sm font-bold text-violet-500 bg-primary/15 border border-primary/25 px-3 py-1 rounded-full">
                {formatMessage(levelTest.questionOf, {
                  current: String(currentQuestion + 1),
                  total: String(questions.length),
                })}
              </span>
            </div>

            <div className="w-full bg-muted rounded-full h-2.5 mb-6">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(currentQuestion / questions.length) * 100}%`,
                }}
              ></div>
            </div>

            <h2 className="text-xl text-foreground/70 font-medium mb-4">
              {questions[currentQuestion].text}
            </h2>

            <div className="flex flex-col gap-3">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="w-full text-left px-6 py-4 rounded-2xl border border-border bg-muted/40 hover:border-primary hover:bg-primary/10 transition-all font-medium text-muted-foreground active:scale-[0.98]"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center gap-6 py-8">
            <div className="w-24 h-24 bg-primary/15 border border-primary/25 rounded-full flex items-center justify-center mb-2">
              <svg
                className="w-12 h-12 text-violet-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            </div>

            <h1 className="text-3xl font-bold text-foreground/70">
              {levelTest.testCompleted}
            </h1>
            <p className="text-gray-500 text-lg">{levelTest.resultLead}</p>

            <div className="text-4xl font-extrabold text-violet-500 my-2">
              {getEnglishLevel()}
            </div>

            <button
              onClick={async () => {
                await refreshProfile();
                navigate("/catalog");
              }}
              className="rounded-[15px] bg-primary px-10 py-5 text-md font-semibold text-foreground/70 hover:bg-purple-hover hover:text-white transition-all hover:cursor-pointer shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
            >
              {levelTest.continueToCatalog}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}