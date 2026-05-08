"use server";

import prisma from "@/lib/prisma";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth-guards";
import { slugify } from "@/lib/utils";


function parseCorrectIndex(rawAnswer: string | number, options: string[]): number | null {
  if (!Array.isArray(options) || options.length < 2) return null;
  const parsed = typeof rawAnswer === "string" ? Number.parseInt(rawAnswer, 10) : rawAnswer;
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
      icon: "🏁",
      criteria: { type: "count", target: "quiz_completed", value: 1 }
    },
    {
      name: "Perfeccionista",
      slug: "score_100",
      description: "Has obtenido un 100% en un cuestionario.",
      icon: "🎯",
      criteria: { type: "event", target: "perfect_score" }
    },
    {
      name: "Constancia Bronze",
      slug: "streak_3",
      description: "Has mantenido una racha de 3 días.",
      icon: "🔥",
      criteria: { type: "streak", value: 3 }
    },
    {
      name: "Constancia Silver",
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
      name: "Aprendiz Avanzado",
      slug: "points_1000",
      description: "Has alcanzado los 1,000 puntos totales.",
      icon: "💎",
      criteria: { type: "points", value: 1000 }
    },
    {
      name: "Sabio del Hub",
      slug: "points_5000",
      description: "Has alcanzado los 5,000 puntos totales.",
      icon: "🧙‍♂️",
      criteria: { type: "points", value: 5000 }
    },
    {
      name: "Colaborador",
      slug: "suggest_question",
      description: "Has sugerido una pregunta para la comunidad.",
      icon: "💡",
      criteria: { type: "event", target: "suggestion" }
    },
    {
      name: "Maestro de la Salud",
      slug: "career_medicina",
      description: "Has completado 5 módulos de Medicina.",
      icon: "🩺",
      criteria: { type: "count", target: "career_quiz", value: 5, career: "medicina" }
    },
    {
      name: "Arquitecto del Saber",
      slug: "career_ingenieria",
      description: "Has completado 5 módulos de Ingeniería.",
      icon: "⚙️",
      criteria: { type: "count", target: "career_quiz", value: 5, career: "ingenieria" }
    },
    {
      name: "Tiburón de Negocios",
      slug: "career_negocios",
      description: "Has completado 5 módulos de Negocios.",
      icon: "📈",
      criteria: { type: "count", target: "career_quiz", value: 5, career: "negocios" }
    }
  ];

  for (const b of defaultBadges) {
    await prisma.badge.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        description: b.description,
        icon: b.icon,
        criteria: b.criteria as any
      },
      create: b as any
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

    // 1. Recursive function to get all JSON files
    const getJsonFiles = (dir: string): string[] => {
      let results: string[] = [];
      const list = readdirSync(dir);
      list.forEach((file) => {
        const path = join(dir, file);
        const stat = statSync(path);
        if (stat && stat.isDirectory()) {
          results = results.concat(getJsonFiles(path));
        } else if (file.endsWith(".json") && file !== "package.json") {
          results.push(path);
        }
      });
      return results;
    };

    const jsonFiles = getJsonFiles(dataDir);

    for (const filePath of jsonFiles) {
      const relativePath = filePath.replace(dataDir, "").replace(/^[\\\/]/, "");
      const pathParts = relativePath.split(/[\\\/]/);
      
      // Level 1: University
      const universityFolder = pathParts[0] || "General";
      const universityName = universityFolder.toUpperCase();
      const universitySlug = slugify(universityName);

      const university = await prisma.university.upsert({
        where: { slug: universitySlug },
        update: {},
        create: {
          name: universityName,
          slug: universitySlug,
          description: `Universidad ${universityName}`,
          logo: universityName === "UDLA" ? "/logos/udla.png" : "/logos/uide.png"
        },
      });

      // Level 2: Career
      const folderName = pathParts[1] || "General";
      const careerName = folderName.charAt(0).toUpperCase() + folderName.slice(1).replace(/-/g, " ");
      const careerSlug = slugify(careerName);

      const raw = readFileSync(filePath, "utf-8");
      let preguntas: any[] = [];
      let theoryText: string | null = null;

      try {
        const data = JSON.parse(raw);
        preguntas = data.preguntas || data.questions || (Array.isArray(data) ? data : []);
        theoryText = data.theory || null;
      } catch (e) {
        continue;
      }

      if (preguntas.length === 0 && !theoryText) continue;

      // Ensure Career exists and is linked to University
      const career = await prisma.career.upsert({
        where: { slug: careerSlug },
        update: { universityId: university.id },
        create: {
          name: careerName,
          slug: careerSlug,
          description: `Carrera de ${careerName} en ${universityName}`,
          universityId: university.id,
          icon: careerName.toLowerCase().includes("medicina") ? "🏥" : careerName.toLowerCase().includes("ingenieria") ? "🏗️" : "📚",
        },
      });

      // Handle Subject and Category
      let subjectId: string | null = null;
      let finalCategoryName: string | null = null;
      
      // Structure: university/career/subject/optional_category_folder/file.json
      if (pathParts.length >= 3) {
        const subjectName = pathParts[2].replace(/_/g, " ");
        const subjectSlug = slugify(subjectName);
        
        const subject = await prisma.subject.upsert({
          where: { careerId_slug: { slug: subjectSlug, careerId: career.id } },
          update: {},
          create: { name: subjectName, slug: subjectSlug, careerId: career.id },
        });
        subjectId = subject.id;

        // If we have 4 or more parts: UIDE/medicina/Anatomia/ADN/part1.json
        if (pathParts.length >= 4) {
          finalCategoryName = pathParts[pathParts.length - 2].replace(/_/g, " ");
        }
      }

      // Extract categories from questions or filename
      const categoryNames = [...new Set(preguntas.map((p) => p.cat || "Varios"))];
      if (categoryNames.length === 0 || (categoryNames.length === 1 && categoryNames[0] === "Varios" && finalCategoryName)) {
        categoryNames[0] = finalCategoryName || pathParts[pathParts.length - 1].replace(".json", "").replace(/_/g, " ");
      }

      const categoryMap: Record<string, string> = {};

      for (const catName of categoryNames) {
        const effectiveCatName = finalCategoryName || catName;
        const slug = slugify(effectiveCatName + "-" + careerSlug);
        
        const category = await prisma.category.upsert({
          where: { careerId_slug: { slug, careerId: career.id } },
          update: { 
            name: effectiveCatName.charAt(0).toUpperCase() + effectiveCatName.slice(1),
            theory: theoryText,
            subjectId: subjectId
          },
          create: {
            name: effectiveCatName.charAt(0).toUpperCase() + effectiveCatName.slice(1),
            slug,
            careerId: career.id,
            theory: theoryText,
            subjectId: subjectId
          },
        });
        categoryMap[catName] = category.id;
      }

      // Insert questions
      const questionsToCreate = preguntas
        .filter((p) => p.q && p.opts && p.opts.length >= 2)
        .map((p) => {
          const correctIndex = parseCorrectIndex(p.ans, p.opts);
          if (correctIndex === null) return null;
          return {
            text: p.q,
            options: p.opts,
            correctIndex: correctIndex,
            hint: p.hint || null,
            explanation: p.just || null,
            categoryId: categoryMap[p.cat || "Varios"] || Object.values(categoryMap)[0],
          };
        })
        .filter(Boolean) as any[];

      if (questionsToCreate.length > 0) {
        const result = await prisma.question.createMany({
          data: questionsToCreate,
          skipDuplicates: true,
        });
        added += result.count;
      }
    }

    await seedBadges();

    revalidatePath("/admin");
    revalidatePath("/badges");
    revalidatePath("/quiz");
    
    return { success: true, message: `Sincronización completa. Se añadieron ${added} preguntas nuevas y se actualizaron los trofeos.` };
  } catch (error: any) {
    console.error("Seed error:", error);
    return { success: false, error: error.message };
  }
}

export async function runMigration() {
  await requireAdmin();
  try {
    console.log("Iniciando sincronización de base de datos (prisma db push)...");
    // Intentar ejecutar prisma db push directamente en el servidor
    // Usamos el path completo de npx si es posible o confiamos en el PATH
    const possibleSchemaPaths = [
      join(process.cwd(), "prisma", "schema.prisma"),
      join(process.cwd(), "schema.prisma"),
      "/app/prisma/schema.prisma", // Ruta común en Docker/Coolify
      "/app/schema.prisma"
    ];

    let schemaPath = "";
    for (const p of possibleSchemaPaths) {
      if (existsSync(p)) {
        schemaPath = p;
        break;
      }
    }

    if (!schemaPath) {
      return { success: false, error: "No se encontró el archivo schema.prisma en el servidor. Verifica que esté en el repositorio." };
    }

    console.log(`Usando esquema en: ${schemaPath}`);
    const output = execSync(`npx prisma db push --schema="${schemaPath}" --accept-data-loss`, { 
      encoding: "utf-8"
    });
    console.log("Resultado de la migración:", output);
    return { success: true, message: "Base de datos sincronizada correctamente: " + output.split('\n').pop() };
  } catch (error: any) {
    console.error("Error detallado de migración:", error);
    const errorMessage = error.stderr || error.message || "Error desconocido";
    return { 
      success: false, 
      error: `Error al sincronizar: ${errorMessage.substring(0, 200)}` 
    };
  }
}


