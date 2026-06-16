import type { ReactNode } from "react"

interface PhoneFrameProps {
  children: ReactNode
}

export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative">
      {/* Phone outer body */}
      <div className="relative w-[360px] h-[740px] rounded-[2.75rem] bg-secondary border-4 border-border shadow-2xl p-3">
        {/* Side buttons */}
        <div className="absolute -left-1 top-32 h-12 w-1 rounded-l bg-border" aria-hidden />
        <div className="absolute -left-1 top-48 h-16 w-1 rounded-l bg-border" aria-hidden />
        <div className="absolute -right-1 top-40 h-20 w-1 rounded-r bg-border" aria-hidden />

        {/* Screen */}
        <div className="relative h-full w-full overflow-hidden rounded-[2rem] bg-background">
          {/* Status bar */}
          <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-6 pt-2.5 pb-1 text-[11px] font-medium text-foreground pointer-events-none">
            <span>9:41</span>
            {/* Camera punch hole */}
            <div className="absolute left-1/2 top-2 -translate-x-1/2 h-3 w-3 rounded-full bg-foreground/80" aria-hidden />
            <div className="flex items-center gap-1.5">
              <SignalIcon />
              <WifiIcon />
              <BatteryIcon />
            </div>
          </div>

          <div className="h-full w-full pt-7">{children}</div>
        </div>
      </div>
    </div>
  )
}

function SignalIcon() {
  return (
    <svg width="14" height="11" viewBox="0 0 16 12" fill="none" className="text-foreground">
      <rect x="0" y="8" width="3" height="4" rx="0.5" fill="currentColor" />
      <rect x="4.5" y="5" width="3" height="7" rx="0.5" fill="currentColor" />
      <rect x="9" y="2.5" width="3" height="9.5" rx="0.5" fill="currentColor" />
      <rect x="13" y="0" width="3" height="12" rx="0.5" fill="currentColor" />
    </svg>
  )
}

function WifiIcon() {
  return (
    <svg width="14" height="11" viewBox="0 0 16 12" fill="none" className="text-foreground">
      <path d="M8 11l2-2.5a2.8 2.8 0 0 0-4 0L8 11z" fill="currentColor" />
      <path d="M3 6.5a7 7 0 0 1 10 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M5 9a4 4 0 0 1 6 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function BatteryIcon() {
  return (
    <svg width="22" height="11" viewBox="0 0 24 12" fill="none" className="text-foreground">
      <rect x="0.5" y="0.5" width="20" height="11" rx="2.5" stroke="currentColor" />
      <rect x="2" y="2" width="14" height="8" rx="1" fill="currentColor" />
      <rect x="22" y="4" width="2" height="4" rx="1" fill="currentColor" />
    </svg>
  )
}
