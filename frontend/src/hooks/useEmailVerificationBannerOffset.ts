import { useEffect, useState } from "react";

export const EMAIL_VERIFICATION_BANNER_HEIGHT_VAR =
  "--email-verification-banner-height";

export function useEmailVerificationBannerOffset(isActive: boolean) {
  const [bannerEl, setBannerEl] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (!isActive || !bannerEl) {
      root.style.removeProperty(EMAIL_VERIFICATION_BANNER_HEIGHT_VAR);
      return;
    }
    const sync_height = () => {
      root.style.setProperty(
        EMAIL_VERIFICATION_BANNER_HEIGHT_VAR,
        `${bannerEl.offsetHeight}px`,
      );
    };
    sync_height();
    const observer = new ResizeObserver(sync_height);
    observer.observe(bannerEl);
    return () => {
      observer.disconnect();
      root.style.removeProperty(EMAIL_VERIFICATION_BANNER_HEIGHT_VAR);
    };
  }, [isActive, bannerEl]);

  return setBannerEl;
}
