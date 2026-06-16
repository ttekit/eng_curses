import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const sdkRoot =
  process.env.ANDROID_HOME?.trim() ||
  process.env.ANDROID_SDK_ROOT?.trim() ||
  join(homedir(), "Library", "Android", "sdk");
const adbPath = join(sdkRoot, "platform-tools", "adb");

export function getAdbPath() {
  if (!existsSync(adbPath)) {
    throw new Error(`adb not found at ${adbPath}`);
  }
  return adbPath;
}

export function runAdb(args) {
  return spawnSync(getAdbPath(), args, { encoding: "utf8" });
}

export function listDevices() {
  runAdb(["start-server"]);
  const result = runAdb(["devices"]);
  if (result.status !== 0) {
    throw new Error(result.stderr || "adb devices failed");
  }
  return result.stdout
    .split("\n")
    .slice(1)
    .map((line) => line.trim())
    .filter((line) => line.endsWith("device"))
    .map((line) => line.split("\t")[0] ?? "")
    .filter(Boolean);
}

export function setup_metro_port_forward() {
  const devices = listDevices();
  if (devices.length === 0) {
    throw new Error(
      "No Android device connected. Enable USB or wireless debugging, then retry.",
    );
  }
  const ports = [
    { devicePort: 8081, hostPort: 8081, label: "Metro" },
    { devicePort: 4200, hostPort: 4200, label: "API" },
  ];
  for (const deviceId of devices) {
    for (const port of ports) {
      const result = runAdb([
        "-s",
        deviceId,
        "reverse",
        `tcp:${port.devicePort}`,
        `tcp:${port.hostPort}`,
      ]);
      if (result.status !== 0) {
        throw new Error(
          result.stderr || `adb reverse failed for ${deviceId} (${port.label})`,
        );
      }
      console.log(`Forwarded ${port.label} (${port.hostPort}) for ${deviceId}`);
    }
  }
}
