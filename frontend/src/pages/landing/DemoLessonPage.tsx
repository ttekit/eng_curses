import { useState } from "react";
import DemoHeader from "../../components/landing/demo-lesson/DemoHeader";
import type { DemoMode } from "../../components/landing/demo-lesson/DemoHeader";
import DemoLessonBody from "../../components/landing/demo-lesson/DemoLessonBody";
import InstructionsModal from "../../components/landing/demo-lesson/InstructionsModal";

export default function DemoLessonPage() {
  const [mode, setMode] = useState<DemoMode>("quickTry");
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);

  return (
    <>
      <div className="relative h-screen bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.65_0.25_295/0.15)_0%,transparent_50%)]" />
        <div className="absolute top-1/4 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-0 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative font-display">
          <DemoHeader mode={mode} onModeChange={setMode} />
          <main className="pt-18 ">
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
      </div>
    </>
  );
}
