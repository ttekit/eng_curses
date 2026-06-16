import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const mobileRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const iosDir = join(mobileRoot, "ios");

function ensure_ios_project() {
  if (existsSync(iosDir)) {
    return;
  }
  console.log("ios/ missing — generating native project with expo prebuild…");
  const result = spawnSync(
    "npx",
    ["expo", "prebuild", "--platform", "ios"],
    { cwd: mobileRoot, stdio: "inherit", shell: true },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

ensure_ios_project();
