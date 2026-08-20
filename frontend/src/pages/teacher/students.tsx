import { useState } from "react";
import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";

export function Students() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  return (
    <div className="bg-background flex min-h-screen ">
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
        <div className="mx-auto px-6">
          <p className="text-3xl font-semibold">Students</p>
        </div>
      </main>
    </div>
  );
}
