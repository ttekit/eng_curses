"use client"

import { useState } from "react"
import { PhoneFrame } from "@/components/mobile/phone-frame"
import { OnboardingScreen } from "@/components/mobile/screens/onboarding-screen"
import { HomeScreen } from "@/components/mobile/screens/home-screen"
import { SearchScreen } from "@/components/mobile/screens/search-screen"
import { ProfileScreen } from "@/components/mobile/screens/profile-screen"
import { LevelTestScreen } from "@/components/mobile/screens/level-test-screen"
import { WatchScreen } from "@/components/mobile/screens/watch-screen"
import { BottomNav } from "@/components/mobile/bottom-nav"

export type MobileScreen = "onboarding" | "home" | "search" | "profile" | "test" | "watch"

export default function MobileAppPage() {
  const [screen, setScreen] = useState<MobileScreen>("onboarding")
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)

  const openVideo = (id: string) => {
    setActiveVideoId(id)
    setScreen("watch")
  }

  const showNav = screen !== "onboarding" && screen !== "watch" && screen !== "test"

  return (
    <main className="min-h-screen w-full bg-gradient-to-b from-background to-secondary/40 flex flex-col items-center justify-center gap-8 p-4 py-10 md:p-10">
      <div className="text-center max-w-md">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground text-balance">
          Exply Mobile
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Interactive Android app concept. Tap through onboarding, browse the catalog, take a test, and track your
          progress.
        </p>
      </div>

      <PhoneFrame>
        <div className="relative h-full w-full overflow-hidden bg-background">
          <div className="h-full w-full overflow-y-auto scrollbar-hide pb-20">
            {screen === "onboarding" && <OnboardingScreen onFinish={() => setScreen("home")} onTest={() => setScreen("test")} />}
            {screen === "home" && <HomeScreen onOpenVideo={openVideo} />}
            {screen === "search" && <SearchScreen onOpenVideo={openVideo} />}
            {screen === "profile" && <ProfileScreen onTakeTest={() => setScreen("test")} />}
            {screen === "test" && <LevelTestScreen onFinish={() => setScreen("home")} onClose={() => setScreen("home")} />}
            {screen === "watch" && (
              <WatchScreen videoId={activeVideoId} onBack={() => setScreen("home")} />
            )}
          </div>

          {showNav && (
            <BottomNav
              active={screen}
              onNavigate={setScreen}
              onResume={() => openVideo("featured")}
            />
          )}
        </div>
      </PhoneFrame>
    </main>
  )
}
