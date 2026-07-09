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
    <>
      <div
        className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="border-border border rounded-[25px] p-7">
          <p className="text-primary text-xl font-bold mb-2">
            {demoInst.title}
          </p>
          <div className="items-start">
            {demoInst.steps.map((item, index) => (
              <>
                <div key={index} className="flex flex-row gap-1">
                  <p className="text-primary">
                    {demoInst.stepName} {index + 1}
                    {"."}
                  </p>
                  <p>{item.step}</p>
                </div>
              </>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
