import { useState, useEffect } from "react";
import type { AdminAnalyticsOverviewDto } from "../../lib/adminAnalyticsApi";
import {
  fetchAdminOverview,
  defaultAnalyticsRange,
} from "../../lib/adminAnalyticsApi";
import { useLandingLocale } from "../../context/LandingLocaleContext";

export default function HeroStats() {
  const { messages } = useLandingLocale();
  const { hero } = messages;
  const [overview, setOverview] = useState<AdminAnalyticsOverviewDto | null>(
    null,
  );

  useEffect(() => {
    const { from, to } = defaultAnalyticsRange();
    fetchAdminOverview(from, to).then(setOverview).catch(console.error);
  }, []);
  return (
    <div className="items-center sm:items-start mx-auto sm:mx-0 flex w-fit flex-row gap-7 sm:gap-20 rounded-[15px] px-6 py-3 text-center text-lg text-foreground/75">
      <div className="flex flex-col items-center">
        <p className="text-primary font-bold text-2xl">
          {overview
            ? (overview.totalUsers + 3259).toString()
            : hero.activeLearnersCount.toString()}
        </p>
        <p className="text-md -mt-2">{hero.users}</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-primary font-bold text-2xl">500+</p>
        <p className="text-md -mt-2">{hero.videos}</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-primary font-bold text-2xl">10,000+</p>
        <p className="text-md -mt-2">{hero.hours}</p>
      </div>
    </div>
  );
}
