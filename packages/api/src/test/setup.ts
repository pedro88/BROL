/**
 * Test setup for @brol/api.
 * Runs before all tests: push Prisma schema to test DB.
 *
 * @package @brol/api
 */

import { beforeAll, afterAll } from "vitest";
import { execSync } from "child_process";
import path from "path";
import { PrismaClient } from "@prisma/client";

const dbUrl =
  process.env.DATABASE_URL ??
  "postgresql://piet:brolpass@localhost:5432/brol_test?schema=public";

/**
 * Global test DB client (used in tests).
 * Created directly from @prisma/client to avoid workspace resolution issues in vitest.
 */
export const prisma = new PrismaClient({
  datasources: {
    db: { url: dbUrl },
  },
});

beforeAll(async () => {
  // Push Prisma schema to test DB
  // __dirname = packages/api/src/test → go up 4 levels to root, then into packages/db
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
  // Clean up: delete all tables
  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      DECLARE
        r RECORD;
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
 * Create a test user in the DB and return their ID.
 */
/**
 * Simple CUID v1-like generator (matches Prisma cuid format).
 * Format: c + timestamp + random hex
 */
function generateCuid(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `c${timestamp}${random}`;
}

export async function createTestUser(overrides: Partial<{
  email: string;
  name: string;
  emailVerified: Date | null;
}> = {}) {
  return prisma.user.create({
    data: {
      id: generateCuid(),
      email: overrides.email ?? `test-${Date.now()}@example.com`,
      name: overrides.name ?? "Test User",
      emailVerified: overrides.emailVerified ?? null,
      updatedAt: new Date(),
    },
  });
}

/**
 * Create a test collection owned by a user.
 */
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

/**
 * Create a test object in a collection.
 */
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
