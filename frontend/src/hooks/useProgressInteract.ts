import { useCallback, useState } from "react";
import { postProgressInteract, type ProgressInteractResponse } from "../lib/srsApi";

export function useProgressInteract() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitInteraction = useCallback(
    async (input: {
      wordId: number;
      isCorrect: boolean;
      timeSinceLastReview: number;
    }): Promise<ProgressInteractResponse | null> => {
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await postProgressInteract(input);
        return result;
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Failed to save progress",
        );
        return null;
      } finally {
        setIsSubmitting(false);
      }
    },
    [],
  );

  return { submitInteraction, isSubmitting, error };
}
