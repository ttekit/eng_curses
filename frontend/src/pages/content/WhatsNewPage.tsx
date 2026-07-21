import { useState, useEffect } from "react";
import { Calendar, ChevronRight, Loader2, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";
import { useLandingLocale } from "../../context/LandingLocaleContext";
import { useAppMessages } from "../../hooks/useAppMessages";
import { BellRing } from "lucide-react";

interface LogType {
  id: number;
  title: string;
  content: string;
  version?: string;
  createdAt: string;
  imageUrl?: string | null;
}

export default function WhatsNewPage() {
  const { locale } = useLandingLocale();
  const messages = useAppMessages().whatsNewPage;

  const [logs, setLogs] = useState<LogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<LogType | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const dateLocale = locale === "uk" ? "uk-UA" : "en-US";

  useEffect(() => {
    const fetchPublishedLogs = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:4200/changelogs", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(messages.fetchError);
        const data = await res.json();
        setLogs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPublishedLogs();
  }, [messages.fetchError]);

  useEffect(() => {
    if (selectedLog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedLog]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <CatalogSidebar
        collapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
        reserveTopNavSpace={false}
      />

      <main
        className={cn(
          "transition-[margin] duration-300 ease-in-out min-h-screen pt-12 pb-20",
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64",
        )}
      >
        <div className="max-w-4xl mx-auto px-6 w-full">
          <div className="text-center space-y-3 mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
              <BellRing className="h-4 w-4" /> {messages.badge}
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight">
              {messages.title}
            </h1>
            <p className="text-muted-foreground text-sm">{messages.subtitle}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 border border-border rounded-xl bg-card">
              <p className="text-muted-foreground">{messages.emptyState}</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-border ml-2 sm:ml-8 space-y-10">
              {logs.map((log) => (
                <div key={log.id} className="relative pl-8 sm:pl-12 group">
                  <div className="absolute -left-[9px] top-2 h-4 w-4 rounded-full border-2 border-primary bg-background group-hover:bg-primary transition-colors" />

                  <div
                    onClick={() => setSelectedLog(log)}
                    className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm transition-all hover:shadow-md hover:border-primary/50 cursor-pointer group/card block"
                  >
                    <div className="flex w-full flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                      <h3 className="font-bold text-xl text-foreground group-hover/card:text-primary transition-colors">
                        {log.title}
                      </h3>
                      {log.version && (
                        <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-mono text-secondary-foreground shrink-0 self-start sm:self-auto">
                          {log.version}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-4">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(log.createdAt).toLocaleDateString(dateLocale, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </div>

                    {log.imageUrl && (
                      <div className="w-full h-48 sm:h-64 mb-4 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={log.imageUrl}
                          alt={log.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line line-clamp-3">
                      {log.content}
                    </p>

                    <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary opacity-80 group-hover/card:opacity-100 transition-opacity">
                      {messages.readMore} <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedLog(null)}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden z-[110]">
            <div className="flex items-center justify-between border-b border-border p-4 sm:px-6 bg-background/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
              <h3 className="font-semibold text-foreground truncate pr-4">
                {messages.badge}
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="flex items-center justify-center h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {selectedLog.imageUrl && (
                <div className="w-full h-48 sm:h-72 bg-muted border-b border-border shrink-0">
                  <img
                    src={selectedLog.imageUrl}
                    alt={selectedLog.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 sm:p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(selectedLog.createdAt).toLocaleDateString(
                      dateLocale,
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                    {selectedLog.version && (
                      <>
                        <span className="px-1">•</span>
                        <span className="font-mono bg-muted px-2 py-0.5 rounded-md text-xs text-foreground">
                          {selectedLog.version}
                        </span>
                      </>
                    )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-foreground leading-tight">
                    {selectedLog.title}
                  </h2>
                </div>

                <div className="h-px w-full bg-border" />

                <div className="prose prose-sm dark:prose-invert max-w-none pb-4">
                  <p className="text-base text-foreground/90 leading-relaxed whitespace-pre-line">
                    {selectedLog.content}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
