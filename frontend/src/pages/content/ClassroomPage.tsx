import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { apiFetch } from "../../lib/api";
import { useUser } from "../../context/UserContext";
import {
  CatalogVideoCard,
  type CatalogCardVideo,
} from "../../components/catalog/CatalogVideoCard";
import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";
import { cn } from "../../lib/utils";
import { GraduationCap } from "lucide-react";
import { useAppMessages } from "../../hooks/useAppMessages";
import { SEO } from "../../components/SEO/SEO";
import { resolveCanonicalUrl } from "../../lib/siteUrl";
import { useLandingLocale } from "../../context/LandingLocaleContext";

export default function ClassroomPage() {
  const [videos, setVideos] = useState<CatalogCardVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const { user } = useUser();
  const { locale } = useLandingLocale();
  const classroom = useAppMessages().classroomPage;
  const isTeacher = user?.role?.toLowerCase() === "teacher";

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function loadClassroom() {
      try {
        const role = user?.role?.toLowerCase();
        const endpoint =
          role === "teacher"
            ? "/contents/teacher/my-series"
            : "/contents/student/teacher-videos";

        const res = await apiFetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data)) {
            setVideos(
              data
                .map((d: any) => ({
                  id: d.contentVideoId || d.contentId,
                  title: d.name,
                  categoryLabel: isTeacher
                    ? classroom.myLesson
                    : classroom.teacherLesson,
                  thumbnailUrl: d.thumbnailUrl,
                  videoLink: d.videoLink,
                }))
                .filter((v: any) => v.id != null),
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadClassroom();
    return () => {
      cancelled = true;
    };
  }, [user, classroom.myLesson, classroom.teacherLesson, isTeacher]);

  return (
    <div className="min-h-screen overflow-x-clip bg-background text-foreground antialiased flex">
      <SEO
        title={classroom.seoTitle}
        description={classroom.seoDescription}
        canonicalUrl={resolveCanonicalUrl("/classroom")}
        ogLocale={locale === "uk" ? "uk_UA" : "en_US"}
        ogLocaleAlternate={locale === "uk" ? "en_US" : "uk_UA"}
        noindex
      />
      <CatalogSidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
        reserveTopNavSpace={false}
      />
      <main
        className={cn(
          "flex-1 w-full pb-24 transition-all duration-300 font-display lg:pb-8",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64",
        )}
      >
        <div className="px-4 sm:px-6 lg:px-8 pt-10">
          <div className="mb-8 border-b border-border/60 pb-6 flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-xl">
              <GraduationCap className="size-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {isTeacher ? classroom.teacherTitle : classroom.studentTitle}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isTeacher ? classroom.teacherLead : classroom.studentLead}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="size-10 animate-spin rounded-full border-4 border-primary border-r-transparent border-b-transparent" />
            </div>
          ) : videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-card/30 py-20 text-center border border-border">
              <img
                src="/SadIcon.svg"
                className="w-24 mb-4 opacity-80"
                alt=""
              />
              <h2 className="text-xl font-bold">{classroom.emptyTitle}</h2>
              <p className="text-muted-foreground mt-2 max-w-md">
                {isTeacher ? classroom.emptyTeacher : classroom.emptyStudent}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {videos.map((video) => (
                <CatalogVideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
