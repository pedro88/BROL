/**
 * One-off backfill: generate handles for existing users without one.
 *
 * Usage: npx tsx packages/db/prisma/backfill-handles.ts
 *
 * @package @brol/db
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const SLUG_MAX_LEN = 16;
const FALLBACK_SLUG = "user";
const MAX_RETRIES = 20;

function slugifyName(name: string | null | undefined): string {
  if (!name) return FALLBACK_SLUG;
  const slug = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, SLUG_MAX_LEN);
  return slug.length > 0 ? slug : FALLBACK_SLUG;
}

function randomSuffix(): string {
  return String(Math.floor(Math.random() * 10000)).padStart(4, "0");
}

async function generateHandle(name: string | null | undefined): Promise<string> {
  const slug = slugifyName(name);
  for (let i = 0; i < MAX_RETRIES; i++) {
    const candidate = `${slug}${randomSuffix()}`;
    const existing = await prisma.user.findUnique({
      where: { handle: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error(`Could not generate unique handle for "${slug}"`);
}

async function main() {
  const users = await prisma.user.findMany({
    where: { handle: null },
    select: { id: true, name: true, email: true },
  });

  console.log(`Found ${users.length} users without handle`);

  for (const user of users) {
    const handle = await generateHandle(user.name ?? user.email.split("@")[0]);
    await prisma.user.update({
      where: { id: user.id },
      data: { handle },
    });
    console.log(`  ${user.email} -> #${handle}`);
  }

  console.log("Done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
