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
            const correctIndex = p.ans - 1;
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
              const correctIndex = p.ans !== undefined ? parseInt(p.ans, 10) : 0;
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

    revalidatePath("/admin");
    return { success: true, message: `Sincronización completa. Se añadieron ${added} preguntas nuevas.` };
  } catch (error) {
    console.error("Seed error:", error);
    return { success: false, error: error.message };
  }
}
