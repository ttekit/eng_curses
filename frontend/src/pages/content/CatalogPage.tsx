import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navigation from "../mainpage/Navigation";
import { apiFetch } from "../../lib/api";
import { useAppMessages } from "../../hooks/useAppMessages";
import { formatMessage } from "../../lib/formatMessage";

type LegacyCatalogVideo = {
  id: number;
  friendlyLink?: string;
  videoName: string;
  content?: { category?: { name?: string } };
};

export default function CatalogPage() {
  const t = useAppMessages().legacyCatalogPage;
  const navigate = useNavigate();

  const [videos, setVideos] = useState<LegacyCatalogVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await apiFetch("/content-video");
        if (response.ok) {
          const data = await response.json();
          setVideos(data);
        } else {
          setError(
            formatMessage(t.serverError, { status: String(response.status) }),
          );
        }
      } catch {
        setError(t.networkError);
      } finally {
        setLoading(false);
      }
    };
    void fetchVideos();
  }, [t.networkError, t.serverError]);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navigation />
      <main className="max-w-7xl mx-auto p-8">
        <h1 className="text-4xl font-bold mb-10">{t.title}</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-900/20 border border-red-500/50 rounded-2xl">
            <h2 className="text-xl font-bold text-red-500">{error}</h2>
            <p className="text-zinc-400 mt-2">{t.consoleHint}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.length > 0 ? (
              videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col group relative"
                >
                  <div className="aspect-video bg-zinc-800 flex items-center justify-center relative">
                    <span className="text-zinc-600 text-xs uppercase font-bold px-4 text-center">
                      {video.content?.category?.name || t.videoFallback}
                    </span>
                  </div>
                  <div className="p-4 grow flex flex-col">
                    <h3 className="font-bold mb-4 line-clamp-1">
                      {video.videoName}
                    </h3>
                    <div className="mt-auto">
                      <button
                        onClick={() => navigate(`/content/${video.friendlyLink || video.id}`)}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-colors"
                      >
                        {t.watchNow}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-zinc-500">
                {t.empty}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
