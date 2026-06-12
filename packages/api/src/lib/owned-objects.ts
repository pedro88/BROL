/**
 * Helpers for the "this object must exist AND belong to the caller" pattern.
 *
 * The pattern `ctx.prisma.object.findFirst({ where: { id, collection: { userId } } })`
 * shows up in 20+ places across `photos`, `objects`, `loans`, `qr`.
 * Each instance had the same shape — lookup, throw NOT_FOUND if missing —
 * but slightly different `include`/`select` clauses. Centralizing the
 * lookup + 404 + ownership check makes the call sites read like the
 * domain intent instead of the Prisma ceremony.
 *
 * @package @brol/api
 */

import { TRPCError } from "@trpc/server";
import type { PrismaClient, Prisma } from "@prisma/client";
import { translate, DEFAULT_LOCALE, type Locale } from "@brol/shared";

/**
 * Lookup an object by id, asserting it belongs to the caller.
 *
 * Throws `TRPCError` with `NOT_FOUND` and the standard "Objet non trouvé"
 * message if the object doesn't exist or is owned by someone else (we
 * deliberately don't distinguish "not found" from "not yours" — that
 * would leak ownership info to a probing client).
 *
 * @param args  Optional `select` / `include` for the Prisma query.
 *              When omitted, the full row is returned.
 */
export async function getOwnedObject<S extends Prisma.ObjectSelect | undefined, I extends Prisma.ObjectInclude | undefined>(
  prisma: PrismaClient,
  userId: string,
  objectId: string,
  args?: { select?: S; include?: I },
  locale: Locale = DEFAULT_LOCALE,
): Promise<NonNullable<Awaited<ReturnType<typeof runObjectQuery<S, I>>>>> {
  const object = await runObjectQuery<S, I>(prisma, userId, objectId, args);
  if (!object) {
    throw new TRPCError({ code: "NOT_FOUND", message: translate(locale, "errors.objectNotFoundOwned") });
  }
  return object as unknown as NonNullable<Awaited<ReturnType<typeof runObjectQuery<S, I>>>>;
}

/**
 * Cheap ownership check. Use when you don't need the object's data —
 * adds 1 row by id, vs a full select. Throws the same way as
 * `getOwnedObject`.
 */
export async function assertObjectOwned(
  prisma: PrismaClient,
  userId: string,
  objectId: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<void> {
  const exists = await prisma.object.findFirst({
    where: { id: objectId, collection: { userId } },
    select: { id: true },
  });
  if (!exists) {
    throw new TRPCError({ code: "NOT_FOUND", message: translate(locale, "errors.objectNotFoundOwned") });
  }
}

/**
 * Lookup a collection by id, asserting it belongs to the caller. Same
 * semantics as `getOwnedObject` but for collections.
 */
export async function getOwnedCollection(
  prisma: PrismaClient,
  userId: string,
  collectionId: string,
  locale: Locale = DEFAULT_LOCALE,
): Promise<NonNullable<Awaited<ReturnType<typeof prisma.collection.findFirst>>>> {
  const collection = await prisma.collection.findFirst({
    where: { id: collectionId, userId },
  });
  if (!collection) {
    throw new TRPCError({ code: "NOT_FOUND", message: translate(locale, "errors.collectionNotFoundOwned") });
  }
  return collection;
}

// Internal helper — overloads to give back the right Prisma payload type.
async function runObjectQuery<
  S extends Prisma.ObjectSelect | undefined,
  I extends Prisma.ObjectInclude | undefined,
>(
  prisma: PrismaClient,
  userId: string,
  objectId: string,
  args?: { select?: S; include?: I },
) {
  if (args?.select) {
    return prisma.object.findFirst({
      where: { id: objectId, collection: { userId } },
      select: args.select,
    });
  }
  return prisma.object.findFirst({
    where: { id: objectId, collection: { userId } },
    ...(args?.include ? { include: args.include } : {}),
  });
}
