import { useState } from "react";
import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";
import { LearnerCustomiseForm } from "../../components/customise/LearnerCustomiseForm";
import { SEO } from "../../components/SEO/SEO";
import { useUser } from "../../context/UserContext";
import { useAppMessages } from "../../hooks/useAppMessages";

export default function CustomisePage() {
  const { user, refreshProfile } = useUser();
  const c = useAppMessages().customisePage;
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  if (!user) {
    return null;
  }

  return (
    <>
      <SEO
        title={c.seoTitle}
        description={c.seoDescription}
        canonicalUrl="/customise"
      />
      <div className="flex min-h-screen bg-background">
        <CatalogSidebar
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
          reserveTopNavSpace={false}
        />
        <main className="flex-1 px-4 py-8 md:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {c.title}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{c.lead}</p>
            <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-sm">
              <LearnerCustomiseForm
                initialJob={user.workField ?? ""}
                initialEducation={user.education ?? ""}
                initialHobbies={user.hobbies ?? []}
                initialFavoriteGenres={user.favoriteGenres ?? []}
                initialHatedGenres={user.hatedGenres ?? []}
                onSaved={async () => {
                  await refreshProfile();
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
