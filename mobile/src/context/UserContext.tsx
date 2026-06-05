/**
 * Authenticated learner session state.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  apiFetch,
  getStoredAccessToken,
  setStoredAccessToken,
} from "../lib/api";
import { normalizeProfile } from "../lib/normalizeProfile";
import type { UserData } from "../types/user";

interface UserContextType {
  user: UserData | null;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserData | null>;
  isLoggedIn: boolean;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async (): Promise<UserData | null> => {
    try {
      const token = await getStoredAccessToken();
      if (!token) {
        setUser(null);
        return null;
      }
      const response = await apiFetch(`/auth/profile?t=${Date.now()}`, {
        method: "GET",
      });
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        setUser(null);
        return null;
      }
      const data: unknown = await response.json();
      const next = normalizeProfile(data);
      setUser(next);
      return next;
    } catch (err) {
      console.error("[UserContext] Failed to fetch profile:", err);
      return null;
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await setStoredAccessToken(null);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        await refreshProfile();
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [refreshProfile]);

  const value = useMemo(
    () => ({
      user,
      logout,
      refreshProfile,
      isLoggedIn: Boolean(user),
      isLoading,
    }),
    [user, logout, refreshProfile, isLoading],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
