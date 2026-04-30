// =============================================================================
// StudyHub — Servicio de Gamificación
// =============================================================================
// Centraliza toda la lógica de gamificación: rachas (streaks), puntos y badges.
// Usado por el endpoint POST /api/quiz-progress después de cada respuesta.
//
// FUNCIONES:
//   - updateUserStats()  → Actualiza racha diaria y suma puntos.
//   - awardBadges()      → Verifica criterios y desbloquea badges nuevos.
// =============================================================================

import prisma from "@/lib/prisma";

/**
 * Actualiza la racha (streak) y los puntos totales del usuario.
 *
 * LÓGICA DE RACHA:
 * - Si nunca ha estado activo → racha = 1 (primer día)
 * - Si la última actividad fue ayer → racha + 1 (día consecutivo)
 * - Si la última actividad fue hace 2+ días → racha = 1 (se perdió)
 * - Si la actividad es del mismo día → racha no cambia
 *
 * @param {string} userId - ID del usuario en la base de datos
 * @param {number} pointsToAdd - Puntos a sumar (1 por respuesta correcta nueva, o score/10 en final)
 * @returns {Promise<Object|null>} Usuario actualizado o null si no existe
 */
export async function updateUserStats(userId, pointsToAdd) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastActive: true, totalPoints: true }
  });

  if (!user) return null;

  const now = new Date();
  const lastActive = user.lastActive ? new Date(user.lastActive) : null;
  let newStreak = user.streak;

  if (!lastActive) {
    // Primera vez que el usuario responde algo
    newStreak = 1;
  } else {
    // Comparar solo las fechas (sin hora) para determinar días consecutivos
    const d1 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const d2 = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    const diffDays = Math.ceil(Math.abs(d1 - d2) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Día consecutivo → incrementar racha
      newStreak += 1;
    } else if (diffDays > 1) {
      // Se saltó uno o más días → resetear racha
      newStreak = 1;
    }
    // Si diffDays === 0 (mismo día), la racha no cambia
  }

  // Actualizar usuario con nueva racha, timestamp, y puntos acumulados
  return await prisma.user.update({
    where: { id: userId },
    data: {
      streak: newStreak,
      lastActive: now,
      totalPoints: { increment: pointsToAdd }
    }
  });
}

/**
 * Verifica criterios de badges y otorga los que el usuario haya desbloqueado.
 *
 * CRITERIOS SOPORTADOS:
 *   - first_quiz     → Completar cualquier quiz por primera vez
 *   - streak_3       → Racha de 3 días consecutivos
 *   - streak_7       → Racha de 7 días consecutivos
 *   - score_100      → Obtener 100% en una categoría
 *   - points_1000    → Acumular 1,000 puntos totales
 *   - points_5000    → Acumular 5,000 puntos totales
 *   - quizzes_10     → Completar 10 cuestionarios
 *   - quizzes_50     → Completar 50 cuestionarios
 *   - career_*       → Completar 5+ quizzes en una carrera específica
 *
 * @param {string} userId - ID del usuario
 * @param {number} calculatedScore - Puntuación del quiz actual (0-100)
 * @returns {Promise<Array>} Array de badges recién desbloqueados (para mostrar toast)
 */
export async function awardBadges(userId, calculatedScore) {
  // Consultar en paralelo: datos del usuario, todos los badges, y badges ya ganados
  const [user, allBadges, existingUserBadges] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { streak: true, totalPoints: true } }),
    prisma.badge.findMany(),
    prisma.userBadge.findMany({
      where: { userId },
      select: { badge: { select: { slug: true } } }
    })
  ]);

  // Set de slugs ya ganados para evitar duplicados
  const earnedSlugs = existingUserBadges.map(ub => ub.badge.slug);
  const badgesToAward = [];

  // ── Verificar cada criterio ──────────────────────────────────────────────
  if (!earnedSlugs.includes("first_quiz")) badgesToAward.push("first_quiz");
  if (user.streak >= 3 && !earnedSlugs.includes("streak_3")) badgesToAward.push("streak_3");
  if (user.streak >= 7 && !earnedSlugs.includes("streak_7")) badgesToAward.push("streak_7");
  if (calculatedScore === 100 && !earnedSlugs.includes("score_100")) badgesToAward.push("score_100");
  if (user.totalPoints >= 1000 && !earnedSlugs.includes("points_1000")) badgesToAward.push("points_1000");
  if (user.totalPoints >= 5000 && !earnedSlugs.includes("points_5000")) badgesToAward.push("points_5000");

  // Badges basados en cantidad total de quizzes completados
  const quizCount = await prisma.quizProgress.count({ where: { userId } });
  if (quizCount >= 10 && !earnedSlugs.includes("quizzes_10")) badgesToAward.push("quizzes_10");
  if (quizCount >= 50 && !earnedSlugs.includes("quizzes_50")) badgesToAward.push("quizzes_50");

  // Badges específicos por carrera (5+ quizzes en medicina, ingeniería, negocios)
  const careersToCheck = ["medicina", "ingenieria", "negocios"];
  for (const cSlug of careersToCheck) {
    if (!earnedSlugs.includes(`career_${cSlug}`)) {
      const countForCareer = await prisma.quizProgress.count({
        where: { userId, category: { career: { slug: cSlug } } }
      });
      if (countForCareer >= 5) badgesToAward.push(`career_${cSlug}`);
    }
  }

  // ── Crear los registros de UserBadge ──────────────────────────────────────
  const unlockedBadges = [];
  for (const slug of badgesToAward) {
    const badge = allBadges.find(b => b.slug === slug);
    if (badge) {
      // .catch(() => {}) para manejar race conditions (doble award simultáneo)
      await prisma.userBadge.create({
        data: { userId, badgeId: badge.id }
      }).catch(() => {}); 
      unlockedBadges.push(badge);
    }
  }

  return unlockedBadges;
}
