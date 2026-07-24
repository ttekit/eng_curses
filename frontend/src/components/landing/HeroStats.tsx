import { useState, useEffect } from "react";
import { useLandingLocale } from "../../context/LandingLocaleContext";

type PublicStatsDto = {
  users: number;
  videos: number;
};

export default function HeroStats() {
  const { messages } = useLandingLocale();
  const { hero } = messages;
  const [stats, setStats] = useState<PublicStatsDto | null>(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "https://api.explys.com";
    fetch(`${apiUrl}/users/public/stats`)
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <div className="items-center sm:items-start mx-auto sm:mx-0 flex w-fit flex-row gap-7 sm:gap-20 rounded-[15px] px-6 py-3 text-center text-lg text-foreground/75">
      <div className="flex flex-col items-center">
        <p className="text-primary font-bold text-2xl">
          {stats ? stats.users.toString() : hero.activeLearnersCount.toString()}
        </p>
        <p className="text-md -mt-2">{hero.users}</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-primary font-bold text-2xl">
          {stats ? `${stats.videos}+` : "500+"}
        </p>
        <p className="text-md -mt-2">{hero.videos}</p>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-primary font-bold text-2xl">10,000+</p>
        <p className="text-md -mt-2">{hero.hours}</p>
      </div>
    </div>
  );
}