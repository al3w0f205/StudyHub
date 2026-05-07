import { spawn } from "node:child_process";
import { join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

/**
 * StudyHub — Database Backup Utility
 * Creates a compressed .sql.gz backup of the PostgreSQL database.
 */

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join(process.cwd(), "backups");
const outputFile = join(backupDir, `backup-${timestamp}.sql`);

if (!existsSync(backupDir)) {
  mkdirSync(backupDir);
}

// Get connection details from environment
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("❌ DATABASE_URL not found in environment.");
  process.exit(1);
}

console.log(`Starting backup: ${outputFile}...`);

// Use pg_dump to create the backup
// Note: pg_dump must be installed on the system (included in nixpacks/docker postgres phase)
const dump = spawn("pg_dump", [dbUrl, "-f", outputFile], {
  shell: true,
});

dump.on("exit", (code) => {
  if (code === 0) {
    console.log(`✅ Backup completed successfully: ${outputFile}`);
    // Optional: Compress the file
    spawn("gzip", [outputFile], { shell: true }).on("exit", () => {
      console.log(`📦 Backup compressed: ${outputFile}.gz`);
    });
  } else {
    console.error(`❌ Backup failed with code ${code}`);
    process.exit(1);
  }
});
