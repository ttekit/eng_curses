import { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { fetchAvailableAvatars, type AvatarOption } from "../../lib/api";
import { useAppMessages } from "../../hooks/useAppMessages";

interface AvatarPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatarUrl: string | null | undefined;
  onSave: (newAvatarUrl: string) => Promise<void>;
}

export function AvatarPickerModal({
  isOpen,
  onClose,
  currentAvatarUrl,
  onSave,
}: AvatarPickerModalProps) {
  const [avatars, setAvatars] = useState<AvatarOption[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(
    currentAvatarUrl || null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const t = useAppMessages().avatarPicker;

  // Подгружаем аватарки при открытии модалки
  useEffect(() => {
    if (isOpen) {
      setIsFetching(true);
      fetchAvailableAvatars()
        .then(setAvatars)
        .catch(console.error)
        .finally(() => setIsFetching(false));

      setSelectedAvatar(currentAvatarUrl || null);
    }
  }, [isOpen, currentAvatarUrl]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!selectedAvatar) return;
    setIsLoading(true);
    try {
      await onSave(selectedAvatar);
      onClose();
    } catch (error) {
      console.error("Failed to save avatar", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">{t.title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-muted text-muted-foreground transition-colors hover:cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto p-2">
          {isFetching ? (
            <div className="col-span-4 text-center text-muted-foreground py-8">
              {t.loading}
            </div>
          ) : avatars.length === 0 ? (
            <div className="col-span-4 text-center text-muted-foreground py-8">
              {t.empty}
            </div>
          ) : (
            avatars.map((avatar) => {
              const isSelected = selectedAvatar === avatar.url;
              return (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.url)}
                  className={`relative aspect-square overflow-hidden rounded-full border-4 transition-all hover:cursor-pointer ${
                    isSelected
                      ? "border-primary scale-110 shadow-lg"
                      : "border-transparent hover:scale-105 hover:border-primary/50"
                  }`}
                >
                  <img
                    src={avatar.url}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Check className="size-6 text-white" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-[15px] px-4 py-2 text-sm hover:cursor-pointer font-medium text-muted-foreground hover:bg-muted transition-colors"
            disabled={isLoading}
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSave}
            disabled={
              !selectedAvatar ||
              isLoading ||
              selectedAvatar === currentAvatarUrl
            }
            className="flex rounded-[15px] bg-primary px-6 py-2 text-sm font-semibold items-center justify-center text-foreground/70 hover:bg-purple-hover hover:text-white transition-all hover:cursor-pointer shadow-[inset_0_4px_12px_rgba(0,0,0,0.6),inset_0_-2px_6px_rgba(255,255,255,0.3)]"
          >
            {isLoading ? t.saving : t.save}
          </button>
        </div>
      </div>
    </div>
  );
}
