/**
 * Test setup for @brol/api.
 * @package @brol/api
 */

import { beforeAll, afterAll } from "vitest";
import { execSync } from "child_process";
import path from "path";
import { PrismaClient } from "@prisma/client";

// SAFETY: the teardown in `afterAll` below drops every table in the
// connected schema. If we accept a DATABASE_URL that points at the live
// dev/prod DB (e.g. `brol`), running `vitest` wipes real user data.
//
// We require an explicit opt-in via `TEST_DATABASE_URL`. If that's not set
// we fall back to a clearly-named `brol_test` DB. We refuse to proceed if
// the resolved URL doesn't end with `_test` (extra belt-and-braces guard).
const dbUrl =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:password@localhost:5432/brol_test?schema=public";

{
  const dbName = new URL(dbUrl).pathname.replace(/^\//, "").split("?")[0];
  if (!dbName.endsWith("_test")) {
    throw new Error(
      `[test setup] Refusing to run tests against DB "${dbName}" — ` +
        `the teardown drops every table. Use TEST_DATABASE_URL pointing at ` +
        `a database whose name ends with "_test" (e.g. "brol_test").`,
    );
  }
}

if (!process.env.TEST_DATABASE_URL) {
  // Intentionally use stderr directly here — the structured logger may not
  // be wired up yet at test boot time.
  process.stderr.write(
    "[test] TEST_DATABASE_URL not set — falling back to brol_test\n",
  );
}

export const prisma = new PrismaClient({
  datasources: { db: { url: dbUrl } },
});

beforeAll(async () => {
  const dbPkgDir = path.resolve(__dirname, "../../../../packages/db");
  const schemaPath = path.resolve(dbPkgDir, "prisma/schema.prisma");
  const prismaBin = path.resolve(dbPkgDir, "node_modules/.bin/prisma");
  try {
    execSync(
      `DATABASE_URL="${dbUrl}" "${prismaBin}" db push --skip-generate --accept-data-loss --schema="${schemaPath}"`,
      { stdio: "pipe", cwd: dbPkgDir }
    );
  } catch (error) {
    console.error("Failed to push Prisma schema to test DB:", error);
    throw error;
  }
}, 60000);

afterAll(async () => {
  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END;
      $$;
    `);
  } catch {
    // Ignore cleanup errors
  }
  await prisma.$disconnect();
});

/**
 * Simple CUID v1-like generator (matches Prisma cuid format).
 */
function generateCuid(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `c${timestamp}${random}`;
}

export async function createTestUser(overrides: Partial<{
  email: string;
  name: string;
  emailVerified: boolean | null;
}> = {}) {
  return prisma.user.create({
    data: {
      id: generateCuid(),
      email: overrides.email ?? `test-${Date.now()}@example.com`,
      name: overrides.name ?? "Test User",
      emailVerified: overrides.emailVerified ?? false,
      updatedAt: new Date(),
    },
  });
}

export async function createTestCollection(ownerId: string, overrides: Partial<{
  name: string;
  description: string | null;
  isPublic: boolean;
}> = {}) {
  return prisma.collection.create({
    data: {
      id: generateCuid(),
      name: overrides.name ?? "Test Collection",
      description: overrides.description ?? null,
      isPublic: overrides.isPublic ?? false,
      userId: ownerId,
    },
  });
}

export async function createTestContact(
  ownerId: string,
  overrides: Partial<{
    name: string;
    email: string | null;
    phone: string | null;
    note: string | null;
    borrowerId: string | null;
  }> = {}
) {
  return prisma.contact.create({
    data: {
      id: generateCuid(),
      name: overrides.name ?? "Test Contact",
      email: overrides.email ?? null,
      phone: overrides.phone ?? null,
      note: overrides.note ?? null,
      borrowerId: overrides.borrowerId ?? null,
      userId: ownerId,
    },
  });
}

export async function createTestObject(collectionId: string, overrides: Partial<{
  name: string;
  author: string | null;
  condition: "NEW" | "LIKE_NEW" | "GOOD" | "FAIR" | "POOR";
  edition: string | null;
  isbn: string | null;
}> = {}) {
  return prisma.object.create({
    data: {
      id: generateCuid(),
      name: overrides.name ?? "Test Object",
      author: overrides.author ?? null,
      condition: overrides.condition ?? "GOOD",
      edition: overrides.edition ?? null,
      isbn: overrides.isbn ?? null,
      collectionId,
    },
  });
}

/**
 * Create a test context: user + profile.
 */
export async function createTestContext() {
  const user = await createTestUser();
  return { userId: user.id, prisma };
}
