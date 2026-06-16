import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const mobileRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function run_prebuild() {
  const result = spawnSync(
    "npx",
    ["expo", "prebuild", "--platform", "ios", "--clean"],
    { cwd: mobileRoot, stdio: "inherit", shell: true },
  );
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run_prebuild();
