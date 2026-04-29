"use server";

import prisma from "@/lib/prisma";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";

function slugify(text) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

function parseCorrectIndex(rawAnswer, options) {
  if (!Array.isArray(options) || options.length < 2) return null;
  const parsed = Number.parseInt(rawAnswer, 10);
  if (!Number.isInteger(parsed)) return null;
  const zeroBased = parsed > 0 ? parsed - 1 : parsed;
  if (zeroBased < 0 || zeroBased >= options.length) return null;
  return zeroBased;
}

async function seedBadges() {
  const defaultBadges = [
    {
      name: "Novato",
      slug: "first_quiz",
      description: "¡Has completado tu primer cuestionario!",
      icon: "🥉",
      criteria: { type: "count", target: "quiz_completed", value: 1 }
    },
    {
      name: "Perfeccionista",
      slug: "score_100",
      description: "Has obtenido un 100% en un cuestionario.",
      icon: "✨",
      criteria: { type: "event", target: "perfect_score" }
    },
    {
      name: "Constancia",
      slug: "streak_3",
      description: "Has mantenido una racha de 3 días.",
      icon: "🔥",
      criteria: { type: "streak", value: 3 }
    },
    {
      name: "Disciplina",
      slug: "streak_7",
      description: "Has mantenido una racha de 7 días.",
      icon: "⚡",
      criteria: { type: "streak", value: 7 }
    },
    {
      name: "Estudiante Activo",
      slug: "quizzes_10",
      description: "Has completado 10 categorías diferentes.",
      icon: "🥈",
      criteria: { type: "count", target: "quiz_completed", value: 10 }
    },
    {
      name: "Devorador de Libros",
      slug: "quizzes_50",
      description: "Has completado 50 categorías diferentes.",
      icon: "🥇",
      criteria: { type: "count", target: "quiz_completed", value: 50 }
    },
    {
      name: "Millonario",
      slug: "points_1000",
      description: "Has alcanzado los 1,000 puntos totales.",
      icon: "💰",
      criteria: { type: "points", value: 1000 }
    },
    {
      name: "Leyenda",
      slug: "points_5000",
      description: "Has alcanzado los 5,000 puntos totales.",
      icon: "💎",
      criteria: { type: "points", value: 5000 }
    },
    {
      name: "Colaborador",
      slug: "suggest_question",
      description: "Has sugerido una pregunta para la comunidad.",
      icon: "💡",
      criteria: { type: "event", target: "suggestion" }
    }
  ];

  for (const b of defaultBadges) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        description: b.description,
        icon: b.icon,
        criteria: b.criteria
      },
      create: b
    });
  }
}

export async function runSeed() {
  await requireAdmin();

  try {
    const dataDir = join(process.cwd(), "data");
    if (!existsSync(dataDir)) {
      return { success: false, error: "La carpeta 'data' no existe en el servidor." };
    }

    let added = 0;
    const items = readdirSync(dataDir);

    // 1. Process old single file format (questions.json) if it exists
    if (items.includes("questions.json")) {
      const raw = readFileSync(join(dataDir, "questions.json"), "utf-8");
      const data = JSON.parse(raw);
      const preguntas = data.preguntas || data.questions || [];
      
      if (preguntas.length > 0) {
        let defaultCareer = await prisma.career.findFirst({ where: { slug: "general" } });
        if (!defaultCareer) {
          defaultCareer = await prisma.career.create({
            data: { name: "General", slug: "general", description: "Preguntas sin clasificar", icon: "📚" }
          });
        }

        for (const p of preguntas) {
          const catName = p.cat || "Varios";
          const catSlug = slugify(catName);
          let category = await prisma.category.findFirst({ where: { slug: catSlug, careerId: defaultCareer.id } });
          if (!category) {
            category = await prisma.category.create({ data: { name: catName.charAt(0).toUpperCase() + catName.slice(1), slug: catSlug, careerId: defaultCareer.id } });
          }
          
          const existing = await prisma.question.findFirst({ where: { text: p.q, categoryId: category.id } });
          if (!existing) {
            const correctIndex = parseCorrectIndex(p.ans, p.opts);
            if (correctIndex === null) continue;
            await prisma.question.create({
              data: {
                text: p.q,
                explanation: p.just || "",
                hint: p.hint || null,
                categoryId: category.id,
                options: p.opts,
                correctIndex: correctIndex,
              },
            });
            added++;
          }
        }
      }
    }

    // 2. Process Folder Structure (e.g. data/medicina/fisiologia.json)
    for (const item of items) {
      if (item === "questions.json") continue;
      
      const careerPath = join(dataDir, item);
      if (statSync(careerPath).isDirectory()) {
        const careerName = item.charAt(0).toUpperCase() + item.slice(1).replace(/-/g, " ");
        const careerSlug = slugify(careerName);
        
        let career = await prisma.career.findFirst({ where: { slug: careerSlug } });
        if (!career) {
          career = await prisma.career.create({
            data: { name: careerName, slug: careerSlug, icon: item === "medicina" ? "⚕️" : "🎓" }
          });
        }

        const categoryFiles = readdirSync(careerPath).filter(f => f.endsWith('.json'));
        
        for (const file of categoryFiles) {
          const catName = file.replace('.json', '').replace(/_/g, " ");
          const catSlug = slugify(catName + "-" + careerSlug); // Ensure unique category slug
          
          let category = await prisma.category.findFirst({ where: { slug: catSlug, careerId: career.id } });
          if (!category) {
            category = await prisma.category.create({
              data: { name: catName.charAt(0).toUpperCase() + catName.slice(1), slug: catSlug, careerId: career.id }
            });
          }

          const raw = readFileSync(join(careerPath, file), "utf-8");
          let data;
          try { data = JSON.parse(raw); } catch (e) { continue; }
          const preguntas = Array.isArray(data) ? data : (data.preguntas || data.questions || []);

          for (const p of preguntas) {
            if (!p.q || !p.opts) continue;
            
            const existing = await prisma.question.findFirst({ where: { text: p.q, categoryId: category.id } });
            if (!existing) {
              const correctIndex = parseCorrectIndex(p.ans, p.opts);
              if (correctIndex === null) continue;
              await prisma.question.create({
                data: {
                  text: p.q,
                  explanation: p.just || "",
                  hint: p.hint || null,
                  categoryId: category.id,
                  options: p.opts,
                  correctIndex: correctIndex,
                },
              });
              added++;
            }
          }
        }
      }
    }

    await seedBadges();

    revalidatePath("/admin");
    revalidatePath("/badges");
    return { success: true, message: `Sincronización completa. Se añadieron ${added} preguntas nuevas y se actualizaron los trofeos.` };
  } catch (error) {
    console.error("Seed error:", error);
    return { success: false, error: error.message };
  }
}
