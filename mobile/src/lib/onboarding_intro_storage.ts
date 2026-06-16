import AsyncStorage from "@react-native-async-storage/async-storage";

const INTRO_SEEN_KEY = "explys:onboarding_intro_seen";

export async function has_seen_onboarding_intro(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(INTRO_SEEN_KEY);
    return value === "1";
  } catch {
    return false;
  }
}

export async function mark_onboarding_intro_seen(): Promise<void> {
  try {
    await AsyncStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // Non-critical preference flag.
  }
}
