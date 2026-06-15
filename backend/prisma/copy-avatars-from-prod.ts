import { execSync } from "node:child_process";
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { getDatabaseUrl } from "../src/config/database-url";
import { require_shuffled_leaderboard_avatars } from "./leaderboard-demo-avatars";

type ProdAvatarRow = {
  url: string;
  key: string;
  isActive: boolean;
  createdAt: string;
};

const DEMO_EMAIL_DOMAIN = "leaderboard-demo.explys.local";
const PROD_API_URL = (
  process.env.PROD_API_URL ?? "https://api.explys.com"
).replace(/\/$/, "");
const PROD_SSH_HOST = process.env.PROD_SSH_HOST?.trim();
const PROD_SSH_USER = process.env.PROD_SSH_USER?.trim() ?? "root";
const PROD_POSTGRES_CONTAINER =
  process.env.PROD_POSTGRES_CONTAINER?.trim() ?? "exply-postgres";
const PROD_DB_NAME = process.env.PROD_DB_NAME?.trim() ?? "eng_curses";

const pool = new Pool({
  connectionString: getDatabaseUrl(),
  ssl: false,
});
const adapter = new PrismaPg(pool as never);
const prisma = new PrismaClient({ adapter });

function fetch_avatars_from_prod_api(): ProdAvatarRow[] {
  const response = execSync(
    `curl -sS "${PROD_API_URL}/avatars"`,
    { encoding: "utf8" },
  );
  const parsed: unknown = JSON.parse(response);
  if (!Array.isArray(parsed)) {
    throw new Error("Production /avatars response was not an array.");
  }
  return parsed.map((row) => normalize_prod_avatar_row(row));
}

function fetch_avatars_from_prod_ssh(): ProdAvatarRow[] {
  if (!PROD_SSH_HOST) {
    throw new Error("Set PROD_SSH_HOST to copy avatars over SSH.");
  }
  const sshPassword = process.env.PROD_SSH_PASSWORD?.trim();
  const sshPrefix = sshPassword
    ? `SSHPASS=${JSON.stringify(sshPassword)} sshpass -e `
    : "";
  const sql =
    "SELECT COALESCE(json_agg(row_to_json(x)), '[]'::json) " +
    "FROM (SELECT url, key, is_active AS \"isActive\", created_at AS \"createdAt\" " +
    "FROM avatars ORDER BY id) x;";
  const remoteCommand = [
    `docker exec ${PROD_POSTGRES_CONTAINER}`,
    "psql -U postgres",
    `-d ${PROD_DB_NAME}`,
    `-t -A -c ${JSON.stringify(sql)}`,
  ].join(" ");
  const command = `${sshPrefix}ssh -o StrictHostKeyChecking=no ${PROD_SSH_USER}@${PROD_SSH_HOST} ${JSON.stringify(remoteCommand)}`;
  const response = execSync(command, { encoding: "utf8" }).trim();
  const parsed: unknown = JSON.parse(response);
  if (!Array.isArray(parsed)) {
    throw new Error("Production SSH avatar export was not an array.");
  }
  return parsed.map((row) => normalize_prod_avatar_row(row));
}

function normalize_prod_avatar_row(row: unknown): ProdAvatarRow {
  if (typeof row !== "object" || row === null) {
    throw new Error("Invalid production avatar row.");
  }
  const record = row as Record<string, unknown>;
  const url = typeof record.url === "string" ? record.url : "";
  const key = typeof record.key === "string" ? record.key : "";
  if (!url || !key) {
    throw new Error("Production avatar row missing url or key.");
  }
  return {
    url,
    key,
    isActive: record.isActive === true,
    createdAt:
      typeof record.createdAt === "string"
        ? record.createdAt
        : new Date().toISOString(),
  };
}

async function upsert_local_avatars(rows: readonly ProdAvatarRow[]): Promise<number> {
  let upserted = 0;
  for (const row of rows) {
    const existing = await prisma.avatar.findFirst({
      where: { key: row.key },
      select: { id: true },
    });
    const createdAt = new Date(row.createdAt);
    if (existing) {
      await prisma.avatar.update({
        where: { id: existing.id },
        data: {
          url: row.url,
          isActive: row.isActive,
          createdAt,
        },
      });
    } else {
      await prisma.avatar.create({
        data: {
          url: row.url,
          key: row.key,
          isActive: row.isActive,
          createdAt,
        },
      });
    }
    upserted += 1;
  }
  return upserted;
}

async function assign_leaderboard_demo_avatars(): Promise<number> {
  const activeAvatars = await prisma.avatar.findMany({
    where: { isActive: true },
    select: { url: true },
    orderBy: { id: "asc" },
  });
  const urls = activeAvatars.map((row) => row.url);
  if (urls.length === 0) {
    return 0;
  }
  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: `@${DEMO_EMAIL_DOMAIN}` } },
    select: { id: true, email: true },
    orderBy: { email: "asc" },
  });
  const shuffled = require_shuffled_leaderboard_avatars(urls, demoUsers.length);
  let updated = 0;
  for (let index = 0; index < demoUsers.length; index += 1) {
    const user = demoUsers[index];
    const avatarUrl = shuffled[index];
    if (!user || !avatarUrl) {
      continue;
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { avatarUrl },
    });
    updated += 1;
  }
  return updated;
}

async function main(): Promise<void> {
  const useSsh = Boolean(PROD_SSH_HOST);
  const rows = useSsh
    ? fetch_avatars_from_prod_ssh()
    : fetch_avatars_from_prod_api();
  const upserted = await upsert_local_avatars(rows);
  const demoUpdated = await assign_leaderboard_demo_avatars();
  console.log(`Copied ${upserted} avatars from production (${useSsh ? "ssh" : "api"}).`);
  console.log(`Updated ${demoUpdated} leaderboard demo user avatars.`);
}

main()
  .catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Avatar copy failed:", message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
