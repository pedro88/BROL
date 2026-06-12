/**
 * Notification router tests.
 *
 * @package @brol/api
 */

import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../../router";
import { prisma, createTestUser } from "../../test/setup";

function callerFor(userId: string) {
  return appRouter.createCaller({
    prisma,
    userId,
    session: { user: { id: userId } },
    headers: {},
  });
}

describe("notificationRouter", () => {
  let alice: Awaited<ReturnType<typeof createTestUser>>;
  let bob: Awaited<ReturnType<typeof createTestUser>>;

  beforeEach(async () => {
    await prisma.notification.deleteMany();
    await prisma.user.deleteMany();
    alice = await createTestUser({ email: "alice@example.com", name: "Alice" });
    bob = await createTestUser({ email: "bob@example.com", name: "Bob" });
  });

  describe("create + list", () => {
    it("creates a notification and returns it from list", async () => {
      await callerFor(alice.id).notification.create({
        userId: alice.id,
        type: "RETURN_REMINDER",
        title: "Rappel",
        message: "À rendre demain",
      });

      const res = await callerFor(alice.id).notification.list({ limit: 20 });
      expect(res.items).toHaveLength(1);
      expect(res.items[0].title).toBe("Rappel");
      expect(res.items[0].userId).toBe(alice.id);
      expect(res.items[0].isRead).toBe(false);
    });

    it("cannot create a notification for another user (FORBIDDEN, fix 2026-06-12)", async () => {
      await expect(
        callerFor(alice.id).notification.create({
          userId: bob.id,
          type: "OVERDUE",
          title: "Spam pour Bob",
        })
      ).rejects.toMatchObject({ code: "FORBIDDEN" });
    });

    it("does not return another user's notifications", async () => {
      await callerFor(bob.id).notification.create({
        userId: bob.id,
        type: "OVERDUE",
        title: "Pour Bob",
      });

      const res = await callerFor(alice.id).notification.list({ limit: 20 });
      expect(res.items).toHaveLength(0);
    });

    it("filters with unreadOnly=true", async () => {
      const n1 = await callerFor(alice.id).notification.create({
        userId: alice.id,
        type: "OVERDUE",
        title: "Non lu",
      });
      await callerFor(alice.id).notification.create({
        userId: alice.id,
        type: "OVERDUE",
        title: "Lu",
      });
      await callerFor(alice.id).notification.markRead({ id: n1.id });

      const unread = await callerFor(alice.id).notification.list({
        unreadOnly: true,
        limit: 20,
      });
      // After marking n1 read, only "Lu" remains unread.
      expect(unread.items).toHaveLength(1);
      expect(unread.items[0].title).toBe("Lu");
    });

    it("requires auth (UNAUTHORIZED for unauthenticated caller)", async () => {
      const unauth = appRouter.createCaller({
        prisma,
        userId: null,
        session: null,
        headers: {},
      });
      await expect(unauth.notification.list({ limit: 20 })).rejects.toThrow(/connecté/);
    });
  });

  describe("unreadCount", () => {
    it("counts only unread notifications for the caller", async () => {
      await callerFor(alice.id).notification.create({
        userId: alice.id,
        type: "OVERDUE",
        title: "A",
      });
      const n = await callerFor(alice.id).notification.create({
        userId: alice.id,
        type: "OVERDUE",
        title: "B",
      });
      await callerFor(alice.id).notification.markRead({ id: n.id });

      const res = await callerFor(alice.id).notification.unreadCount();
      expect(res.count).toBe(1);
    });

    it("returns 0 when there are no notifications", async () => {
      const res = await callerFor(alice.id).notification.unreadCount();
      expect(res.count).toBe(0);
    });
  });

  describe("markRead", () => {
    it("marks a notification as read", async () => {
      const n = await callerFor(alice.id).notification.create({
        userId: alice.id,
        type: "OVERDUE",
        title: "À lire",
      });
      const res = await callerFor(alice.id).notification.markRead({ id: n.id });
      expect(res.isRead).toBe(true);
    });

    it("throws NOT_FOUND on unknown id", async () => {
      await expect(
        callerFor(alice.id).notification.markRead({ id: "unknown" }),
      ).rejects.toThrow();
    });

    it("throws FORBIDDEN when marking another user's notification", async () => {
      const n = await callerFor(bob.id).notification.create({
        userId: bob.id,
        type: "OVERDUE",
        title: "Pour Bob",
      });
      await expect(
        callerFor(alice.id).notification.markRead({ id: n.id }),
      ).rejects.toThrow();
    });
  });

  describe("markAllRead", () => {
    it("marks all of the caller's unread notifications as read", async () => {
      await callerFor(alice.id).notification.create({
        userId: alice.id,
        type: "OVERDUE",
        title: "A",
      });
      await callerFor(alice.id).notification.create({
        userId: alice.id,
        type: "OVERDUE",
        title: "B",
      });

      await callerFor(alice.id).notification.markAllRead();

      const remaining = await callerFor(alice.id).notification.unreadCount();
      expect(remaining.count).toBe(0);
    });

    it("does not touch another user's notifications", async () => {
      await callerFor(bob.id).notification.create({
        userId: bob.id,
        type: "OVERDUE",
        title: "Bob's",
      });
      await callerFor(alice.id).notification.markAllRead();
      const bobUnread = await callerFor(bob.id).notification.unreadCount();
      expect(bobUnread.count).toBe(1);
    });
  });
});
