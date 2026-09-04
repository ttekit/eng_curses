import { useState } from "react";
import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";
import { TopBar } from "../../components/Topbar";

interface TeacherLayoutProps {
  children: React.ReactNode;
}

export function TeacherLayout({ children }: TeacherLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <CatalogSidebar
        collapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
        reserveTopNavSpace={false}
      />
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <TopBar />
        {children}
      </main>
    </div>
  );
}
