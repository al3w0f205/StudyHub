/**
 * StudyHub — Create Admin Script
 * Creates an admin user with email/password credentials.
 *
 * Usage: node scripts/create-admin.js
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import { createInterface } from "readline";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log("═══════════════════════════════════════");
  console.log("  StudyHub — Crear Administrador");
  console.log("═══════════════════════════════════════\n");

  const name = await prompt("Nombre: ");
  const email = await prompt("Email: ");
  const password = await prompt("Contraseña: ");

  if (!email || !password) {
    console.error("❌ Email y contraseña son requeridos.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Update existing user to admin
    await prisma.user.update({
      where: { email },
      data: {
        role: "ADMIN",
        password: await bcrypt.hash(password, 12),
        name: name || existing.name,
      },
    });
    console.log(`\n✅ Usuario ${email} actualizado a ADMIN`);
  } else {
    await prisma.user.create({
      data: {
        name: name || "Admin",
        email,
        password: await bcrypt.hash(password, 12),
        role: "ADMIN",
        emailVerified: new Date(),
      },
    });
    console.log(`\n✅ Administrador creado: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
