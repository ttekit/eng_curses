import { useEffect, type RefObject } from "react";

export const EMAIL_VERIFICATION_BANNER_HEIGHT_VAR =
  "--email-verification-banner-height";

export function use_email_verification_banner_offset(
  isActive: boolean,
  bannerRef: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    const root = document.documentElement;
    if (!isActive) {
      root.style.removeProperty(EMAIL_VERIFICATION_BANNER_HEIGHT_VAR);
      return;
    }
    const el = bannerRef.current;
    if (!el) {
      return;
    }
    const sync_height = () => {
      root.style.setProperty(
        EMAIL_VERIFICATION_BANNER_HEIGHT_VAR,
        `${el.offsetHeight}px`,
      );
    };
    sync_height();
    const observer = new ResizeObserver(sync_height);
    observer.observe(el);
    return () => {
      observer.disconnect();
      root.style.removeProperty(EMAIL_VERIFICATION_BANNER_HEIGHT_VAR);
    };
  }, [isActive, bannerRef]);
}
