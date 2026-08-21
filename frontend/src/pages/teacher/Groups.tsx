import { useState } from "react";
import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";
import { TopBar } from "../../components/Topbar";

export function Groups() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="bg-background text-foreground flex min-h-screen">
      <CatalogSidebar
        collapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
        reserveTopNavSpace={false}
      />

      <main
        className={`flex-1 transition-all duration-300 pt-8 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <TopBar />
      </main>
    </div>
  );
}
