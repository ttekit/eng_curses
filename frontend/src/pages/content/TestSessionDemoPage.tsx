import { TestSessionEngine } from "../../components/test-session/TestSessionEngine";
import { MOCK_TEST_QUESTIONS } from "../../components/test-session/mock-test-questions";

/**
 * Demo page for TestSessionEngine with mock questions.
 */
export default function TestSessionDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <TestSessionEngine
        questions={MOCK_TEST_QUESTIONS}
        onSessionComplete={() => {
          window.alert("Demo session complete!");
        }}
      />
    </div>
  );
}
