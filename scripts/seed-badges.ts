import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const badges = [
  {
    name: "Primer Paso",
    slug: "first_quiz",
    description: "Completa tu primer cuestionario.",
    icon: "🎯",
    criteria: { type: "completed_quizzes", count: 1 }
  },
  {
    name: "Estudiante Constante",
    slug: "streak_3",
    description: "Mantén una racha de 3 días.",
    icon: "🔥",
    criteria: { type: "streak", count: 3 }
  },
  {
    name: "Maestro del Conocimiento",
    slug: "points_1000",
    description: "Acumula 1,000 puntos totales.",
    icon: "👑",
    criteria: { type: "total_points", count: 1000 }
  },
  {
    name: "Perfeccionista",
    slug: "score_100",
    description: "Obtén un 100% en cualquier cuestionario.",
    icon: "✨",
    criteria: { type: "perfect_score", count: 1 }
  },
  {
    name: "Explorador",
    slug: "categories_5",
    description: "Completa cuestionarios de 5 materias diferentes.",
    icon: "🗺️",
    criteria: { type: "unique_categories", count: 5 }
  }
];

async function main() {
  console.log("🏅 Seeding badges...");
  for (const b of badges) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: b,
      create: b
    });
  }
  console.log("✅ Badges seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
