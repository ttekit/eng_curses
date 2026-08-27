import { cn } from "../../lib/utils";

type SegmentedProgressBarProps = {
  readonly totalSegments: number;
  readonly filledSegments: number;
};

/**
 * Instagram-style segmented progress bar.
 */
export function SegmentedProgressBar({
  totalSegments,
  filledSegments,
}: SegmentedProgressBarProps) {
  if (totalSegments <= 0) {
    return null;
  }
  return (
    <div className="flex w-full gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={totalSegments} aria-valuenow={filledSegments}>
      {Array.from({ length: totalSegments }, (_, index) => (
        <div
          key={index}
          className="h-1 flex-1 overflow-hidden rounded-full bg-muted/80"
        >
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              index < filledSegments ? "bg-emerald-500" : "bg-transparent",
            )}
            style={{
              width: index < filledSegments ? "100%" : "0%",
            }}
          />
        </div>
      ))}
    </div>
  );
}
