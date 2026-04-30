// =============================================================================
// StudyHub — Singleton de Prisma Client (PostgreSQL)
// =============================================================================
// Crea y exporta una única instancia de PrismaClient para toda la aplicación.
//
// PATRÓN SINGLETON:
// En desarrollo, Next.js hace hot-reload y recrea los módulos frecuentemente.
// Sin este patrón, cada reload crearía una NUEVA conexión a la DB, agotando
// rápidamente el pool de conexiones de PostgreSQL.
//
// SOLUCIÓN:
// - En DESARROLLO: Guardamos la instancia en `globalThis` para reutilizarla.
// - En PRODUCCIÓN: Se crea una sola instancia (no hay hot-reload).
//
// ADAPTADOR:
// Usamos @prisma/adapter-pg con pg.Pool para compatibilidad con PostgreSQL
// y Prisma's driver adapter pattern (requerido para algunos deployment targets).
// =============================================================================

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

/** @type {typeof globalThis & { prisma?: PrismaClient }} */
const globalForPrisma = globalThis;

/**
 * Crea una nueva instancia de PrismaClient con el adaptador de PostgreSQL.
 * @returns {PrismaClient} Instancia configurada de Prisma
 */
function createPrismaClient() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

/** @type {PrismaClient} Instancia singleton de Prisma */
const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Solo cachear en desarrollo para evitar múltiples conexiones por hot-reload
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
