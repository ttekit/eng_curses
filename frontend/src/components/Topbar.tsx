import { ChevronDown } from "lucide-react";
import { Settings } from "lucide-react";
import { BellRing } from "lucide-react";
import { Building2 } from "lucide-react";
import { Link } from "react-router";

export function TopBar() {
  return (
    <div className="flex h-16 w-full items-center justify-between border-b border-border px-4 bg-background">
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-1.5 transition-colors hover:bg-muted hover:cursor-pointer">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-500">
          <Building2 className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium text-foreground">
          Nordic Retail AB
        </span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/whats-new"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted"
        >
          <BellRing className="h4 w-4 text-muted-foreground" />
        </Link>

        <Link
          to="/profile?tab=settings"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card transition-colors hover:bg-muted"
        >
          <Settings className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </div>
  );
}
