import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck, Loader2, Lock, X } from "lucide-react";
import toast from "react-hot-toast";
import { apiFetch, getApiBase, getResponseErrorMessage } from "../../lib/api";
import { useUser } from "../../context/UserContext";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { cn } from "../../lib/utils";
import { isTrustedIframeMessageOrigin } from "../../lib/trustedMessageOrigin";

function patchTestDocApiOrigin(html: string, apiOrigin: string): string {
  if (!apiOrigin) return html;
  return html.replace(
    /(<meta\s+name="explys-placement-api-origin"\s+content=")([^"]*)(")/i,
    `$1${apiOrigin.replace(/"/g, "&quot;")}$3`,
  );
}

type Props = {
  phaseIndex: number;
  isActivePhase: boolean;
  isLastPhase: boolean;
  hasPassedPhaseFinalTest: boolean;
  prerequisitesComplete: boolean;
};

export function PhaseFinalTestPanel({
  phaseIndex,
  isActivePhase,
  isLastPhase,
  hasPassedPhaseFinalTest,
  prerequisitesComplete,
}: Props) {
  const { refreshProfile } = useUser();
  const { messages } = useLandingLocale();
  const copy = messages.learningPlanPhases;
  const [isOpen, setIsOpen] = useState(false);
  const [docHtml, setDocHtml] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingDoc, setIsLoadingDoc] = useState(false);

  const showCta =
    isActivePhase &&
    !isLastPhase &&
    !hasPassedPhaseFinalTest &&
    prerequisitesComplete;
  const showLocked =
    isActivePhase &&
    !isLastPhase &&
    !hasPassedPhaseFinalTest &&
    !prerequisitesComplete;

  useEffect(() => {
    if (!isOpen) {
      setDocHtml(null);
      setLoadError(null);
      return;
    }
    let cancelled = false;
    setIsLoadingDoc(true);
    setLoadError(null);
    void (async () => {
      try {
        const res = await apiFetch("/phase-final-test/document", {
          method: "GET",
        });
        if (!res.ok) {
          const msg = await getResponseErrorMessage(res);
          if (!cancelled) setLoadError(msg);
          return;
        }
        const html = await res.text();
        if (!cancelled) {
          setDocHtml(
            patchTestDocApiOrigin(html, getApiBase().replace(/\/$/, "")),
          );
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : copy.phaseFinalTestLoadError,
          );
        }
      } finally {
        if (!cancelled) setIsLoadingDoc(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, copy.phaseFinalTestLoadError]);

  const onTestMessage = useCallback(
    (event: MessageEvent) => {
      if (!isTrustedIframeMessageOrigin(event.origin)) {
        return;
      }
      if (event.data?.type !== "phase_final_test_complete") {
        return;
      }
      const passed = event.data?.result?.passed === true;
      void (async () => {
        await refreshProfile();
        setIsOpen(false);
        if (passed) {
          toast.success(copy.phaseFinalTestPassedToast);
        } else {
          toast.error(copy.phaseFinalTestFailedToast);
        }
      })();
    },
    [
      refreshProfile,
      copy.phaseFinalTestPassedToast,
      copy.phaseFinalTestFailedToast,
    ],
  );

  useEffect(() => {
    if (!isOpen) return;
    window.addEventListener("message", onTestMessage);
    return () => window.removeEventListener("message", onTestMessage);
  }, [isOpen, onTestMessage]);

  if (!showCta && !showLocked && !hasPassedPhaseFinalTest) {
    return null;
  }

  return (
    <div className="mb-3">
      {hasPassedPhaseFinalTest ?
        <p className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-800 dark:text-emerald-300">
          <ClipboardCheck className="size-4 shrink-0" aria-hidden />
          {copy.phaseFinalTestPassedBadge}
        </p>
      : showLocked ?
        <p className="inline-flex items-center gap-2 rounded-lg border border-dashed border-muted-foreground/35 bg-muted/25 px-3 py-2.5 text-sm text-muted-foreground">
          <Lock className="size-4 shrink-0" aria-hidden />
          {copy.phaseFinalTestLocked}
        </p>
      : showCta ?
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <ClipboardCheck className="size-4" aria-hidden />
          {copy.phaseFinalTestCta}
        </button>
      : null}

      {isOpen ?
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={copy.phaseFinalTestCta}
        >
          <div className="relative flex h-[min(92vh,820px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">
                {copy.phaseFinalTestModalTitle.replace(
                  "{phase}",
                  String(phaseIndex + 1),
                )}
              </p>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                aria-label={copy.phaseFinalTestClose}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="relative min-h-0 flex-1 bg-muted/20">
              {isLoadingDoc ?
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-5 animate-spin" aria-hidden />
                  {copy.phaseFinalTestLoading}
                </div>
              : loadError ?
                <p className="p-6 text-sm text-destructive">{loadError}</p>
              : docHtml ?
                <iframe
                  title={copy.phaseFinalTestCta}
                  srcDoc={docHtml}
                  className={cn("h-full w-full border-0 bg-white")}
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              : null}
            </div>
          </div>
        </div>
      : null}
    </div>
  );
}
