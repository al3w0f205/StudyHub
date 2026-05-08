/**
 * StudyHub — Seed Script
 * Reads questions from data/questions.json and inserts them into PostgreSQL via Prisma.
 *
 * JSON format expected:
 * {
 *   "preguntas": [
 *     { "cat": "calculo", "q": "...", "opts": ["A","B","C","D"], "ans": 1, "just": "...", "hint": "..." }
 *   ]
 * }
 *
 * Usage: npx tsx scripts/seed.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { readFileSync, existsSync, readdirSync, statSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function slugify(text: string): string {
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

async function main() {
  const dataDir = resolve(__dirname, "../data");
  
  if (!existsSync(dataDir)) {
    console.error("❌ Data directory not found:", dataDir);
    process.exit(1);
  }

  // Recursive function to get all JSON files
  const getJsonFiles = (dir: string): string[] => {
    let results: string[] = [];
    const list = readdirSync(dir);
    list.forEach((file) => {
      const path = resolve(dir, file);
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
  console.log(`📂 Found ${jsonFiles.length} JSON files to process.`);

  for (const filePath of jsonFiles) {
    const relativePath = filePath.replace(dataDir, "").replace(/^[\\\/]/, "");
    const pathParts = relativePath.split(/[\\\/]/);
    
    // Level 1: University
    const universityFolder = pathParts[0] || "General";
    const universityName = universityFolder.toUpperCase();
    const universitySlug = slugify(universityName);

    console.log(`\n🏛️ University: ${universityName}`);
    
    const university = await prisma.university.upsert({
      where: { slug: universitySlug },
      update: {},
      create: {
        name: universityName,
        slug: universitySlug,
        description: `Universidad ${universityName}`,
      },
    });

    // Level 2: Career
    const folderName = pathParts[1] || "General";
    const careerName = folderName.charAt(0).toUpperCase() + folderName.slice(1);
    const careerSlug = slugify(careerName);

    console.log(`📖 Processing: ${filePath}`);
    console.log(`🎓 Target Career: ${careerName}`);

    const raw = readFileSync(filePath, "utf-8");
    let preguntas: any[] = [];
    let theoryText: string | null = null;

    try {
      const data = JSON.parse(raw);
      preguntas = data.preguntas || data.questions || (Array.isArray(data) ? data : []);
      theoryText = data.theory || null;
    } catch (e: any) {
      console.error(`  ❌ Failed to parse ${filePath}:`, e.message);
      continue;
    }

    if (preguntas.length === 0 && !theoryText) {
      console.log("  ⚠️ No questions or theory found, skipping.");
      continue;
    }

    // ── Step 1: Ensure Career exists ──
    let career = await prisma.career.upsert({
      where: { slug: careerSlug },
      update: { universityId: university.id },
      create: {
        name: careerName,
        slug: careerSlug,
        description: `Carrera de ${careerName}`,
        icon: careerName.toLowerCase().includes("medicina") ? "🏥" : careerName.toLowerCase().includes("ingenieria") ? "🏗️" : "📚",
        universityId: university.id,
      },
    });

    // ── Step 2: Extract unique categories in this file ──
    const categoryNames = [...new Set(preguntas.map((p) => p.cat))];
    
    // If there are no questions but there is theory, we might have a single category name in the JSON or use the filename
    if (categoryNames.length === 0 && theoryText) {
      const catFromFilename = resolve(filePath).split(/[\\\/]/).pop()?.replace(".json", "") || "General";
      categoryNames.push(catFromFilename);
    }

    // ── Step 2.5: Handle Subject and Category (with deep merging support) ──
    let subjectId: string | null = null;
    let finalCategoryName: string | null = null;
    
    // Structure: university/career/subject/optional_category_folder/file.json
    if (pathParts.length >= 3) {
      const subjectNameRaw = pathParts[2]; // index 2 now
      const subjectName = subjectNameRaw.replace(/_/g, " ");
      const subjectSlug = slugify(subjectName);
      
      const subject = await prisma.subject.upsert({
        where: { careerId_slug: { slug: subjectSlug, careerId: career.id } },
        update: {},
        create: { name: subjectName, slug: subjectSlug, careerId: career.id },
      });
      subjectId = subject.id;

      // If we have 4 parts: UIDE/medicina/Anatomia/ADN/part1.json
      if (pathParts.length >= 4) {
        finalCategoryName = pathParts[pathParts.length - 2].replace(/_/g, " ");
        console.log(`  🔗 Merging into Category: ${finalCategoryName}`);
      }
    }

    const categoryMap: Record<string, string> = {};

    for (const catName of categoryNames) {
      // Use the folder name if we are in a deep structure, otherwise use the JSON property or filename
      const effectiveCatName = finalCategoryName || catName;
      const slug = slugify(effectiveCatName);
      
      let category = await prisma.category.upsert({
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

    // ── Step 3: Insert questions ──
    const questionsToCreate = preguntas
      .filter((p) => p.q && p.opts && p.opts.length >= 2 && p.ans !== undefined)
      .map((p) => ({
        text: p.q,
        options: p.opts,
        correctIndex: p.ans,
        hint: p.hint || null,
        explanation: p.just || null,
        categoryId: categoryMap[p.cat],
      }));

    if (questionsToCreate.length > 0) {
      const result = await prisma.question.createMany({
        data: questionsToCreate,
        skipDuplicates: true,
      });
      console.log(`  ✅ Inserted ${result.count} questions into ${careerName}.`);
    }
  }

  console.log("\n═══════════════════════════════════════");
  console.log("✨ All data files processed successfully!");
  console.log("═══════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Global Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
