import { useCallback, useEffect, useRef } from "react";

const WHEEL_DELTA_THRESHOLD = 12;
const SWIPE_DELTA_THRESHOLD = 48;
const WHEEL_COOLDOWN_MS = 700;

export function useFeedNavigation(
  slideCount: number,
  activeIndex: number,
  onIndexChange: (index: number) => void,
  enabled = true,
) {
  const activeIndexRef = useRef(activeIndex);
  const wheelLockedRef = useRef(false);

  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  const move_by = useCallback(
    (direction: number) => {
      if (!enabled || slideCount <= 1) {
        return;
      }
      const nextIndex = Math.max(
        0,
        Math.min(activeIndexRef.current + direction, slideCount - 1),
      );
      if (nextIndex === activeIndexRef.current) {
        return;
      }
      activeIndexRef.current = nextIndex;
      onIndexChange(nextIndex);
    },
    [enabled, onIndexChange, slideCount],
  );

  useEffect(() => {
    if (!enabled || slideCount <= 1) {
      return;
    }

    const onWheel = (event: WheelEvent): void => {
      if (Math.abs(event.deltaY) < WHEEL_DELTA_THRESHOLD) {
        return;
      }
      event.preventDefault();
      if (wheelLockedRef.current) {
        return;
      }
      wheelLockedRef.current = true;
      window.setTimeout(() => {
        wheelLockedRef.current = false;
      }, WHEEL_COOLDOWN_MS);
      move_by(event.deltaY > 0 ? 1 : -1);
    };

    let touchStartY: number | null = null;
    const onTouchStart = (event: TouchEvent): void => {
      touchStartY = event.touches[0]?.clientY ?? null;
    };
    const onTouchEnd = (event: TouchEvent): void => {
      if (touchStartY == null) {
        return;
      }
      const endY = event.changedTouches[0]?.clientY ?? touchStartY;
      const delta = touchStartY - endY;
      touchStartY = null;
      if (Math.abs(delta) < SWIPE_DELTA_THRESHOLD) {
        return;
      }
      move_by(delta > 0 ? 1 : -1);
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        move_by(1);
      }
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        move_by(-1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled, move_by, slideCount]);

  return { moveBy: move_by };
}
