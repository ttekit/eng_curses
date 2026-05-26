import { useEffect, useState, useRef } from "react";
import { Upload, Eye, EyeOff } from "lucide-react";

import {
  AdminCard,
  AdminCardHeader,
  AdminCardTitle,
  AdminCardDescription,
  AdminCardContent,
  AdminButton,
  AdminBadge,
} from "../../components/admin/adminUi";

import {
  fetchAdminAvatars,
  uploadAdminAvatar,
  toggleAdminAvatarStatus,
  type AdminAvatarRow,
} from "../../lib/adminAvatarsApi";

export default function AdminAvatarsPage() {
  const [avatars, setAvatars] = useState<AdminAvatarRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadAvatars = async () => {
    try {
      setIsLoading(true);
      const data = await fetchAdminAvatars();
      setAvatars(data);
    } catch (error) {
      console.error("Failed to fetch avatars", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAvatars();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      await uploadAdminAvatar(file);
      await loadAvatars();
    } catch (error) {
      console.error("Failed to upload avatar", error);
      alert("Ошибка при загрузке. Проверьте консоль.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      await toggleAdminAvatarStatus(id, !currentStatus);
      await loadAvatars();
    } catch (error) {
      console.error("Failed to change status", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Avatars
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage predefined profile pictures for users.
          </p>
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
        <AdminButton
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload New"}
        </AdminButton>
      </div>

      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle>Avatar Library</AdminCardTitle>
          <AdminCardDescription>
            Active avatars are visible in the user profile modal.
          </AdminCardDescription>
        </AdminCardHeader>
        <AdminCardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Loading...
            </div>
          ) : avatars.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No avatars uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  className="group relative flex flex-col items-center gap-3"
                >
                  <div
                    className={`relative aspect-square w-full overflow-hidden rounded-2xl border-2 transition-all ${
                      avatar.isActive
                        ? "border-transparent shadow-sm"
                        : "border-destructive/30 opacity-50 grayscale"
                    }`}
                  >
                    <img
                      src={avatar.url}
                      alt="Avatar option"
                      className="h-full w-full object-cover"
                    />

                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                      <AdminButton
                        variant={avatar.isActive ? "danger" : "primary"}
                        size="icon"
                        onClick={() =>
                          handleToggleStatus(avatar.id, avatar.isActive)
                        }
                        title={
                          avatar.isActive ? "Hide from users" : "Show to users"
                        }
                      >
                        {avatar.isActive ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </AdminButton>
                    </div>
                  </div>
                  <AdminBadge variant={avatar.isActive ? "default" : "danger"}>
                    {avatar.isActive ? "Active" : "Hidden"}
                  </AdminBadge>
                </div>
              ))}
            </div>
          )}
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
