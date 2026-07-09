import { useState } from "react";
import DemoHeader from "../../components/landing/demo-lesson/DemoHeader";
import type { DemoMode } from "../../components/landing/demo-lesson/DemoHeader";
import DemoLessonBody from "../../components/landing/demo-lesson/DemoLessonBody";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import InstructionsModal from "../../components/landing/demo-lesson/InstructionsModal";

export default function DemoLessonPage() {
  const { messages } = useLandingLocale();
  const demo = messages.demoLessonPage;

  const [mode, setMode] = useState<DemoMode>("quickTry");
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  return (
    <>
      <div className="font-display">
        <DemoHeader mode={mode} onModeChange={setMode} />
        <main className="pt-18">
          <DemoLessonBody
            mode={mode}
            onOpenInstructions={() => setIsInstructionsOpen(true)}
          />
        </main>

        <InstructionsModal
          isOpen={isInstructionsOpen}
          onClose={() => setIsInstructionsOpen(false)}
        />
      </div>
    </>
  );
}
