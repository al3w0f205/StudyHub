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
 * Usage: node scripts/seed.js
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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

async function main() {
  const filePath = resolve(__dirname, "../data/questions.json");

  if (!existsSync(filePath)) {
    console.error("❌ File not found:", filePath);
    console.error("   Create data/questions.json with your questions first.");
    process.exit(1);
  }

  console.log("📖 Reading questions from", filePath);
  const raw = readFileSync(filePath, "utf-8");
  const data = JSON.parse(raw);
  const preguntas = data.preguntas || data.questions || [];

  if (preguntas.length === 0) {
    console.error("❌ No questions found in the JSON file.");
    process.exit(1);
  }

  console.log(`📊 Found ${preguntas.length} questions`);

  // ── Step 1: Extract unique categories ──
  const categoryNames = [...new Set(preguntas.map((p) => p.cat))];
  console.log(`📁 Found ${categoryNames.length} unique categories:`, categoryNames);

  // ── Step 2: Create a default career if none exists ──
  let defaultCareer = await prisma.career.findFirst();
  if (!defaultCareer) {
    defaultCareer = await prisma.career.create({
      data: {
        name: "General",
        slug: "general",
        description: "Carrera predeterminada para preguntas importadas",
        icon: "📚",
      },
    });
    console.log("🎓 Created default career: General");
  }

  // ── Step 3: Upsert categories ──
  const categoryMap = {};
  for (const catName of categoryNames) {
    const slug = slugify(catName);
    let category = await prisma.category.findFirst({
      where: { slug, careerId: defaultCareer.id },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: catName.charAt(0).toUpperCase() + catName.slice(1),
          slug,
          careerId: defaultCareer.id,
        },
      });
      console.log(`  ✅ Created category: ${category.name}`);
    } else {
      console.log(`  ⏭️  Category exists: ${category.name}`);
    }

    categoryMap[catName] = category.id;
  }

  // ── Step 4: Insert questions ──
  let inserted = 0;
  let skipped = 0;
  const batchSize = 100;
  const batches = [];

  for (let i = 0; i < preguntas.length; i += batchSize) {
    batches.push(preguntas.slice(i, i + batchSize));
  }

  for (const batch of batches) {
    const questionsToCreate = batch
      .filter((p) => {
        if (!p.q || !p.opts || p.opts.length < 2 || p.ans === undefined) {
          skipped++;
          return false;
        }
        return true;
      })
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
      inserted += result.count;
    }
  }

  console.log("\n═══════════════════════════════════════");
  console.log("✅ Migration complete!");
  console.log(`   Inserted: ${inserted} questions`);
  console.log(`   Skipped:  ${skipped} (invalid format)`);
  console.log(`   Categories: ${categoryNames.length}`);
  console.log("═══════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
