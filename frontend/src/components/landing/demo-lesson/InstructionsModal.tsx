import { X } from "lucide-react";
import { useLandingLocale } from "../../../context/LandingLocaleContext";

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InstructionsModal({
  isOpen,
  onClose,
}: InstructionsModalProps) {
  const { messages } = useLandingLocale();
  const demoInst = messages.demoLessonPage.instructions;
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-[25px] border border-border bg-card p-7 shadow-2xl shadow-primary/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-row justify-between items-center mb-5">
          <p className=" pr-8 text-xl font-bold text-primary">
            {demoInst.title}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition-all duration-300 hover:cursor-pointer hover:bg-primary/30 bg-primary/10 hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {demoInst.steps.map((item, index) => (
            <div key={index} className="flex flex-row items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <p className="leading-relaxed text-foreground">{item.step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
