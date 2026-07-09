import type { DemoMode } from "./DemoHeader";
import { useLandingLocale } from "../../../context/LandingLocaleContext";
import { useState } from "react";

interface DemoLessonBodyProps {
  mode: DemoMode;
  onOpenInstructions: () => void;
}

export default function DemoLessonBody({
  mode,
  onOpenInstructions,
}: DemoLessonBodyProps) {
  const { messages } = useLandingLocale();
  const demo = messages.demoLessonPage;

  switch (mode) {
    case "quickTry":
      return (
        <div className="flex flex-row justify-between mt-3">
          <div className="flex flex-col ml-5">
            <p className="text-2xl font-bold mb-1">
              {demo.quickTryContent.title}
            </p>
            <p className="text-muted-foreground">
              {demo.quickTryContent.describtion}
            </p>
          </div>

          <button
            onClick={onOpenInstructions}
            className="rounded-full bg-primary/30 hover:cursor-pointer hover:bg-primary/60 w-fit px-4 py-1 m-1 transition-all duration-200"
          >
            {demo.howToUse}
          </button>
        </div>
      );
    case "wholeLesson":
      return (
        <div className="flex flex-row justify-between mt-3">
          <div className="flex flex-col ml-5">
            <p className="text-2xl font-bold mb-1">
              {demo.wholeLessonContent.title}
            </p>
            <p className="text-muted-foreground">
              {demo.wholeLessonContent.describtion}
            </p>
          </div>

          <button
            onClick={onOpenInstructions}
            className="rounded-full bg-primary/30 hover:cursor-pointer hover:bg-primary/60 w-fit px-4 py-1 m-1 transition-all duration-200"
          >
            {demo.howToUse}
          </button>
        </div>
      );
  }
}
