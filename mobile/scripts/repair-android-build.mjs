import { existsSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const mobileRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const androidRoot = join(mobileRoot, "android");

const stalePaths = [
  join(androidRoot, "app", "build", "intermediates", "linked_resources_binary_format"),
  join(androidRoot, "app", "build", "intermediates", "packaged_res"),
  join(androidRoot, ".gradle"),
];

function removePathIfExists(targetPath) {
  if (!existsSync(targetPath)) {
    return;
  }
  rmSync(targetPath, { recursive: true, force: true });
  console.log(`Removed ${targetPath}`);
}

function repair_android_build() {
  if (!existsSync(androidRoot)) {
    throw new Error(
      "android/ folder missing. Run: npx expo prebuild --platform android",
    );
  }
  for (const targetPath of stalePaths) {
    removePathIfExists(targetPath);
  }
  console.log(
    "Android build cache repaired. Avoid `./gradlew clean` with New Architecture enabled.",
  );
}

repair_android_build();
