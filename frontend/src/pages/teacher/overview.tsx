import { useState } from "react";
import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";

export function Overview() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
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
        <div className=" mx-auto px-6 w-full">
          <p className="text-3xl font-semibold">
            здесь будет обзор для учителя
          </p>
        </div>
      </main>
    </div>
  );
}
