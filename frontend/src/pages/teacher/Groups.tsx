import { useState } from "react";
import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";

export function Groups() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

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
        <div className="px-6 w-full mx-auto">
          <p className="text-3xl font-semibold">
            здесь будет страница групп для учителя
          </p>
        </div>
      </main>
    </div>
  );
}
