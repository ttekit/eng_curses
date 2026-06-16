import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  listDevices,
  runAdb,
  setup_metro_port_forward,
} from "./android-adb.mjs";

const mobileRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const apkPath = join(
  mobileRoot,
  "android",
  "app",
  "build",
  "outputs",
  "apk",
  "debug",
  "app-debug.apk",
);

function install_apk(deviceId, attempt) {
  const result = runAdb([
    "-s",
    deviceId,
    "install",
    "-r",
    "-d",
    "--user",
    "0",
    apkPath,
  ]);
  if (result.status === 0) {
    console.log(`Installed on ${deviceId}`);
    return true;
  }
  console.error(`Install attempt ${attempt} failed on ${deviceId}:`);
  console.error(result.stderr || result.stdout);
  return false;
}

function install_android_apk() {
  if (!existsSync(apkPath)) {
    throw new Error("Debug APK missing. Run: npm run android");
  }

  const devices = listDevices();
  if (devices.length === 0) {
    throw new Error(
      "No Android device connected. Enable USB or wireless debugging, then retry.",
    );
  }

  const maxAttempts = 3;
  for (const deviceId of devices) {
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      if (install_apk(deviceId, attempt)) {
        return;
      }
      runAdb(["reconnect", "offline"]);
      runAdb(["reconnect"]);
    }
  }

  throw new Error("adb install failed after retries.");
}

install_android_apk();
setup_metro_port_forward();
console.log("Metro must be running. In another terminal: npm start");
console.log("Then reload the app on the device (shake -> Reload).");
