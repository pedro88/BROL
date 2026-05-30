/**
 * Tests for handle generation utilities.
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "../../test/setup";
import { generateHandle, slugifyName } from "../handle";

describe("slugifyName", () => {
  it("lowercases and strips diacritics", () => {
    expect(slugifyName("Élodie")).toBe("elodie");
  });

  it("removes non-alphanumeric characters", () => {
    expect(slugifyName("Jean-Marc O'Connor")).toBe("jeanmarcoconnor");
  });

  it("falls back to 'user' for null or empty input", () => {
    expect(slugifyName(null)).toBe("user");
    expect(slugifyName(undefined)).toBe("user");
    expect(slugifyName("")).toBe("user");
  });

  it("falls back when all characters are stripped", () => {
    expect(slugifyName("!!!@@@")).toBe("user");
  });

  it("truncates to 16 characters", () => {
    const long = "a".repeat(50);
    expect(slugifyName(long)).toBe("a".repeat(16));
  });
});

describe("generateHandle", () => {
  beforeEach(async () => {
    await prisma.user.deleteMany();
  });

  it("produces a slug + 4-digit suffix", async () => {
    const handle = await generateHandle(prisma, "Alice");
    expect(handle).toMatch(/^alice\d{4}$/);
  });

  it("uses the fallback slug when name is null", async () => {
    const handle = await generateHandle(prisma, null);
    expect(handle).toMatch(/^user\d{4}$/);
  });

  it("avoids collision with an existing handle", async () => {
    // Pre-seed every possible suffix for slug "bob" to force exhaustion
    // would take 10 000 inserts — instead seed one and verify the next
    // returned handle is different from it.
    const taken = "bob0000";
    await prisma.user.create({
      data: {
        id: `taken-${Date.now()}`,
        email: `taken-${Date.now()}@example.com`,
        name: "Bob",
        handle: taken,
        updatedAt: new Date(),
      },
    });

    for (let i = 0; i < 10; i++) {
      const candidate = await generateHandle(prisma, "Bob");
      expect(candidate).not.toBe(taken);
      expect(candidate).toMatch(/^bob\d{4}$/);
    }
  });
});
