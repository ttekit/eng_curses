import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const mobileRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const gradlePropertiesPath = join(mobileRoot, "android", "gradle.properties");

const performanceProperties = {
  "org.gradle.caching": "true",
  "org.gradle.configureondemand": "true",
  "org.gradle.parallel": "true",
  "org.gradle.daemon": "true",
  "org.gradle.jvmargs":
    "-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8",
  reactNativeArchitectures: "arm64-v8a",
};

function upsertGradleProperty(contents, key, value) {
  const pattern = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;
  if (pattern.test(contents)) {
    return contents.replace(pattern, line);
  }
  return `${contents.trimEnd()}\n${line}\n`;
}

function optimizeGradleProperties() {
  if (!existsSync(gradlePropertiesPath)) {
    return;
  }
  let contents = readFileSync(gradlePropertiesPath, "utf8");
  for (const [key, value] of Object.entries(performanceProperties)) {
    contents = upsertGradleProperty(contents, key, value);
  }
  writeFileSync(gradlePropertiesPath, contents, "utf8");
  console.log(`Optimized ${gradlePropertiesPath}`);
}

optimizeGradleProperties();
