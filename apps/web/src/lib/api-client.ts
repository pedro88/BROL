/**
 * Client API direct — remplace tRPC pour les appels HTTP.
 * Résout les problèmes de compatibilité tRPC + React 19.
 * @package @brol/web
 */

import { getSessionToken } from "./auth-store";

const getApiBase = () =>
  `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api`;

// ============================================================================
// Generic helpers
// ============================================================================

async function trpcCall<T>(endpoint: string, args?: unknown): Promise<T> {
  const token = getSessionToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${getApiBase()}/trpc/${endpoint}`;
  const res = await fetch(url, {
    method: args !== undefined ? "POST" : "GET",
    headers,
    body: args !== undefined ? JSON.stringify(args) : undefined,
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      msg = err?.error?.json?.message ?? err?.error?.message ?? msg;
    } catch {
      // ignore parse error
    }
    throw new Error(msg);
  }

  const data = await res.json();
  return data.result?.data as T;
}

// ============================================================================
// Types
// ============================================================================

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  coverImage: string | null;
  ownerId: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionWithCounts extends Collection {
  ownerName: string | null;
  objectCount: number;
  loanCount?: number;
}

export interface CollectionDetail extends CollectionWithCounts {
  objects: ObjectInCollection[];
  owner?: { id: string; name: string | null; image: string | null } | null;
}

export interface ObjectInCollection {
  id: string;
  name: string;
  author: string | null;
  edition: string | null;
  isbn: string | null;
  barcode: string | null;
  condition: string;
  notes: string | null;
  collectionId: string;
  loans?: LoanInObject[];
  createdAt: string;
  updatedAt: string;
}

export interface LoanInObject {
  id: string;
  objectId: string;
  borrowerId: string;
  status: "ACTIVE" | "RETURNED" | "OVERDUE";
  loanedAt: string;
  returnDueDate: string | null;
  borrower?: { id: string; name: string | null; image: string | null };
}

// ============================================================================
// Collections
// ============================================================================

export async function listCollections(): Promise<Collection[]> {
  const data = await trpcCall<{ items: Collection[]; nextCursor: unknown }>(
    "collections.list"
  );
  return data.items;
}

export async function listPublicCollections(): Promise<CollectionWithCounts[]> {
  const data = await trpcCall<{ items: CollectionWithCounts[]; nextCursor: unknown }>(
    "collections.listPublic"
  );
  return data.items;
}

export async function getCollection(id: string): Promise<CollectionDetail> {
  return trpcCall<CollectionDetail>("collections.get", { id });
}

export async function getPublicCollection(id: string): Promise<CollectionDetail> {
  return trpcCall<CollectionDetail>("collections.getPublic", { id });
}

export async function createCollection(data: {
  name: string;
  description?: string;
  isPublic?: boolean;
}): Promise<{ id: string }> {
  return trpcCall("collections.create", data);
}

export async function updateCollection(
  id: string,
  data: { name?: string; description?: string; isPublic?: boolean }
): Promise<{ id: string }> {
  return trpcCall("collections.update", { id, ...data });
}

export async function deleteCollection(id: string): Promise<void> {
  await trpcCall("collections.delete", { id });
}

// ============================================================================
// Objects
// ============================================================================

export async function createObject(data: {
  name: string;
  author?: string;
  edition?: string;
  isbn?: string;
  barcode?: string;
  condition?: string;
  notes?: string;
  collectionId: string;
}): Promise<{ id: string; collectionId: string }> {
  return trpcCall("objects.create", data);
}

export async function updateObject(
  id: string,
  data: Partial<{
    name: string;
    author: string;
    edition: string;
    isbn: string;
    barcode: string;
    condition: string;
    notes: string;
  }>
): Promise<{ id: string }> {
  return trpcCall("objects.update", { id, ...data });
}

export async function deleteObject(id: string): Promise<void> {
  await trpcCall("objects.delete", { id });
}

export async function listObjects(collectionId: string): Promise<ObjectInCollection[]> {
  const data = await trpcCall<{ items: ObjectInCollection[]; nextCursor: unknown }>(
    "objects.list",
    { collectionId }
  );
  return data.items;
}
