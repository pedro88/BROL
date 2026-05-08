/**
 * Package DB - Client Prisma et utilitaires base de données.
 * @package @brol/db
 */

import path from "path";
import dotenv from "dotenv";

// Load .env from project root BEFORE Prisma initializes
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import { PrismaClient } from "@prisma/client";

// Singleton pour éviter d'instancier plusieurs clients en développement
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

/**
 * Obtient une instance singleton du client Prisma.
 * En développement, réutilise l'instance globale pour éviter les erreurs HMR.
 * dotenv charge DATABASE_URL depuis .env à la racine avant l'init de Prisma.
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
