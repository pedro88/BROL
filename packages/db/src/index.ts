/**
 * Package DB - Client Prisma et utilitaires base de données.
 * @package @brol/db
 */

import { PrismaClient } from "@prisma/client";

// Singleton pour éviter d'instancier plusieurs clients en développement
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __prismaConnected: boolean | undefined;
}

/**
 * Obtient une instance singleton du client Prisma.
 * L'instance est créée mais la connexion est lazy (à la première utilisation).
 */
export function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return new PrismaClient({
      log: process.env.DEBUG ? ["query", "error", "warn"] : ["error"],
    });
  }

  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: process.env.DEBUG ? ["query", "error", "warn"] : ["error"],
    });
  }

  return global.__prisma;
}

/**
 * Instance Prisma lazy - la connexion n'est PAS faite au démarrage.
 * Utilise $connect() manuellement ou utilise les méthodes qui font du lazy connect.
 */
let _prisma: PrismaClient | null = null;

export function getLazyPrisma(): PrismaClient {
  if (!_prisma) {
    _prisma = getPrismaClient();
  }
  return _prisma;
}

/**
 * Proxy Prisma avec fallback gracieux.
 * Si la DB n'est pas disponible, retourne null au lieu de throw.
 */
export function getSafePrisma(): { prisma: PrismaClient | null; error: string | null } {
  try {
    return { prisma: getLazyPrisma(), error: null };
  } catch (error) {
    return { 
      prisma: null, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

/**
 * Déconnecte le client Prisma (à appeler à l'arrêt du serveur).
 */
export async function disconnectPrisma(): Promise<void> {
  if (_prisma) {
    await _prisma.$disconnect();
    _prisma = null;
  }
  if (global.__prisma) {
    await global.__prisma.$disconnect();
    global.__prisma = undefined;
  }
}

/**
 * Connecte le client Prisma avec gestion d'erreur.
 * @returns true si connecté, false si échec
 */
export async function connectPrisma(): Promise<boolean> {
  try {
    const client = getLazyPrisma();
    await client.$connect();
    global.__prismaConnected = true;
    console.log("✅ Database connected");
    return true;
  } catch (error) {
    global.__prismaConnected = false;
    console.error("❌ Database connection failed:", error instanceof Error ? error.message : error);
    return false;
  }
}

/**
 * Vérifie si la connexion à la DB est active.
 */
export async function isDbConnected(): Promise<boolean> {
  try {
    const client = getLazyPrisma();
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/**
 * Status de la connexion DB.
 */
export interface DbStatus {
  connected: boolean;
  error: string | null;
  checkedAt: string;
}

/**
 *获取le status de la DB sans modifier l'état de connexion.
 */
export async function getDbStatus(): Promise<DbStatus> {
  try {
    const client = getLazyPrisma();
    await client.$queryRaw`SELECT 1`;
    return { connected: true, error: null, checkedAt: new Date().toISOString() };
  } catch (error) {
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : "Connection failed",
      checkedAt: new Date().toISOString() 
    };
  }
}

// Export par défaut pour compatibilité (lazy)
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getLazyPrisma();
    const value = (client as any)[prop];
    
    if (typeof value === "function") {
      return async (...args: any[]) => {
        const connected = await connectPrisma();
        if (!connected) {
          throw new Error("Database unavailable");
        }
        return value.apply(client, args);
      };
    }
    
    return value;
  },
});
