// =============================================================================
// StudyHub — Servicio de Suscripción y Control de Acceso
// =============================================================================
// Centraliza la verificación de acceso a carreras según la suscripción del usuario.
// Usado por el endpoint POST /api/quiz-progress para validar que el usuario
// tiene permiso para responder preguntas de una carrera específica.
//
// MODELO DE ACCESO:
//   - Cada usuario tiene un campo `allowedCareers` (string separado por comas).
//   - Ejemplo: "medicina,ingenieria" → acceso a esas dos carreras.
//   - "" o null → sin acceso a ninguna carrera (usuario nuevo o sin pago).
//   - Los ADMIN tienen acceso total a todas las carreras.
//   - Si la suscripción expiró (subscriptionExpiry < now), se deniega el acceso.
//   - Si el usuario está suspendido, se deniega el acceso.
// =============================================================================

import prisma from "@/lib/prisma";

/**
 * Verifica si un usuario tiene acceso a una carrera específica.
 * Consulta directamente la DB para obtener datos actualizados.
 *
 * @param {Object} user - Objeto del usuario (de session o DB), debe contener `id` y `role`
 * @param {string} careerSlug - Slug de la carrera a verificar (ej: "medicina")
 * @returns {Promise<boolean>} true si tiene acceso, false si no
 */
export async function hasCareerAccess(user, careerSlug) {
  // Sin usuario = sin acceso
  if (!user) return false;

  // Los administradores tienen acceso irrestricto
  if (user.role === "ADMIN") return true;

  // Consultar datos frescos de la DB (no confiar solo en el JWT)
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { subscriptionExpiry: true, allowedCareers: true, isSuspended: true }
  });

  // Usuario no encontrado o suspendido → sin acceso
  if (!dbUser || dbUser.isSuspended) return false;

  // Verificar que la suscripción esté vigente
  const isSubActive = dbUser.subscriptionExpiry && new Date(dbUser.subscriptionExpiry) > new Date();
  if (!isSubActive) return false;

  // Verificar que la carrera específica esté en la lista de carreras permitidas
  const allowedCareers = dbUser.allowedCareers?.split(",").filter(Boolean) ?? [];
  return allowedCareers.includes(careerSlug);
}
