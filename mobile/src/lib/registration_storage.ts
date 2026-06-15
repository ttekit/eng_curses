import AsyncStorage from "@react-native-async-storage/async-storage";

const DRAFT_KEY = "exply_registration_draft";
const PENDING_WELCOME_KEY = "exply_pending_login_welcome";

export async function read_registration_draft(): Promise<unknown> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export async function write_registration_draft(data: object): Promise<void> {
  try {
    await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export async function clear_registration_draft(): Promise<void> {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export async function set_pending_registration_welcome(): Promise<void> {
  try {
    await AsyncStorage.setItem(PENDING_WELCOME_KEY, "1");
  } catch {
    /* ignore */
  }
}

export async function consume_pending_registration_welcome(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(PENDING_WELCOME_KEY);
    if (value !== "1") {
      return false;
    }
    await AsyncStorage.removeItem(PENDING_WELCOME_KEY);
    return true;
  } catch {
    return false;
  }
}
