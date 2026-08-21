import { useState } from "react";
import { CatalogSidebar } from "../../components/catalog/CatalogSidebar";
import { Users } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { Gauge } from "lucide-react";
import { Clock } from "lucide-react";
import { GraduationCap } from "lucide-react";
import { ClipboardCheck } from "lucide-react";
import { Award } from "lucide-react";
import { TopBar } from "../../components/Topbar";

export function Overview() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <CatalogSidebar
        collapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
        reserveTopNavSpace={false}
      />
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        }`}
      >
        <TopBar />

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 w-full mt-4 px-6">
          <div className="flex flex-col rounded-[20px] bg-card border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                <Users className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500">
                <TrendingUp className="h-3 w-3 " />
                <span>8%</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground tracking-tight">
                {" "}
                12
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                / 14
              </span>
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Active students
            </p>
            <div className="mt-4 w-full">
              <svg
                className="w-full h-8 stroke-emerald-500"
                viewBox="0 0 100 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 25C20 20 40 30 60 15C80 0 100 10 100 10"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col rounded-[20px] bg-card border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                <Gauge className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500">
                <TrendingUp className="h-3 w-3 " />
                <span>5%</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground tracking-tight">
                {" "}
                16
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                %
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Avg. progress</p>
            <div className="mt-4 w-full">
              <svg
                className="w-full h-8 stroke-emerald-500"
                viewBox="0 0 100 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 25C20 20 40 30 60 15C80 0 100 10 100 10"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col rounded-[20px] bg-card border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                <Clock className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500">
                <TrendingUp className="h-3 w-3 " />
                <span>8%</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground tracking-tight">
                {" "}
                124.9
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                h
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Learning hours(mo)
            </p>
            <div className="mt-4 w-full">
              <svg
                className="w-full h-8 stroke-emerald-500"
                viewBox="0 0 100 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 25C20 20 40 30 60 15C80 0 100 10 100 10"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col rounded-[20px] bg-card border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500">
                <TrendingUp className="h-3 w-3 " />
                <span>8%</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground tracking-tight">
                {" "}
                43
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                %
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Completion rate
            </p>
            <div className="mt-4 w-full">
              <svg
                className="w-full h-8 stroke-emerald-500"
                viewBox="0 0 100 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 25C20 20 40 30 60 15C80 0 100 10 100 10"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col rounded-[20px] bg-card border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                <ClipboardCheck className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500">
                <TrendingUp className="h-3 w-3 " />
                <span>8%</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground tracking-tight">
                {" "}
                6
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Reviews pending
            </p>
            <div className="mt-4 w-full">
              <svg
                className="w-full h-8 stroke-emerald-500"
                viewBox="0 0 100 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 25C20 20 40 30 60 15C80 0 100 10 100 10"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
          <div className="flex flex-col rounded-[20px] bg-card border border-border p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                <Award className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-500">
                <TrendingUp className="h-3 w-3 " />
                <span>8%</span>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground tracking-tight">
                3
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Certificates(mo)
            </p>
            <div className="mt-4 w-full">
              <svg
                className="w-full h-8 stroke-emerald-500"
                viewBox="0 0 100 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 25C20 20 40 30 60 15C80 0 100 10 100 10"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
        <div className="w-6/10 mt-6 ml-6 flex flex-col rounded-[20px] bg-card border border-border shadow-sm min-h-80">
          <div className="flex items-start justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Daily Active
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Learning minutes across the organization - last 14 days
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-500">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-500"></span>
              Live
            </div>
          </div>
          <div className="flex  mt-1 border-b"></div>
        </div>
      </main>
    </div>
  );
}
