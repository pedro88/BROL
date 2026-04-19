/**
 * Package DB - Client Prisma et utilitaires base de données.
 * @package @brol/db
 */

import { PrismaClient } from "@prisma/client";

// Singleton pour éviter d'instancier plusieurs clients en développement
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Obtient une instance singleton du client Prisma.
 * En développement, réutilise l'instance globale pour éviter les erreurs HMR.
 */
export function getPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === "production") {
    return new PrismaClient();
  }

  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: process.env.DEBUG ? ["query", "error", "warn"] : ["error"],
    });
  }

  return global.__prisma;
}

/**
 * Instance Prisma par défaut pour l'export.
 */
export const prisma = getPrismaClient();

/**
 * Déconnecte le client Prisma (à appeler à l'arrêt du serveur).
 */
export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}

/**
 * Connecte le client Prisma.
 */
export async function connectPrisma(): Promise<void> {
  await prisma.$connect();
}
