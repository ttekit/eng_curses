/**
 * Post-build prerender for marketing routes (`/` and `/pricing`).
 * Runs after `vite build`; requires `vite preview` and Puppeteer.
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = path.resolve(__dirname, "..");
const distDir = path.join(frontendRoot, "dist");
const previewPort = 4173;
const previewOrigin = `http://127.0.0.1:${previewPort}`;
const routes = ["/", "/pricing"];

function waitForServer(url, timeoutMs = 30000) {
  const started = Date.now();
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url);
        if (res.ok) {
          resolve();
          return;
        }
      } catch {
        /* retry */
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error(`Preview server did not start within ${timeoutMs}ms`));
        return;
      }
      setTimeout(() => {
        void tick();
      }, 250);
    };
    void tick();
  });
}

async function main() {
  const preview = spawn(
    "npx",
    ["vite", "preview", "--host", "127.0.0.1", "--port", String(previewPort), "--strictPort"],
    {
      cwd: frontendRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  );

  const shutdown = () => {
    preview.kill("SIGTERM");
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  try {
    await waitForServer(`${previewOrigin}/`);
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1440, height: 900 });
      for (const route of routes) {
        const url = `${previewOrigin}${route}`;
        await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
        await page.waitForSelector("#root", { timeout: 15000 });
        await new Promise((r) => setTimeout(r, 500));
        const html = await page.content();
        if (route === "/") {
          await writeFile(path.join(distDir, "index.html"), html, "utf8");
        } else {
          const outDir = path.join(distDir, route.slice(1));
          await mkdir(outDir, { recursive: true });
          await writeFile(path.join(outDir, "index.html"), html, "utf8");
        }
        console.log(`[prerender] wrote ${route}`);
      }
    } finally {
      await browser.close();
    }
  } finally {
    shutdown();
  }
}

main().catch((error) => {
  console.error("[prerender] failed:", error);
  process.exit(1);
});
