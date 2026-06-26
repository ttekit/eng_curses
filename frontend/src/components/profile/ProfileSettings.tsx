import { useUser } from "../../context/UserContext";
import { ProfileInfoCard } from "./ProfileInfoCard";
import { AppearanceCard } from "./AppearanceCard";
import { SecurityCard } from "./SecurityCard";
import { DangerZoneCard } from "./DangerZoneCard";

export function ProfileSettings({ onSaved }: { onSaved: () => Promise<void> }) {
  const { user } = useUser();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <ProfileInfoCard onSaved={onSaved} />

      <AppearanceCard />

      <SecurityCard />

      <DangerZoneCard />
    </div>
  );
}
