import { z } from "zod";

/**
 * Validates environment variables at runtime.
 * If any variable is missing or malformed, the app will throw an error and stop.
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // Auth
  AUTH_SECRET: z.string().min(1),
  AUTH_TRUST_HOST: z.string().optional().default("true"),

  // Google OAuth
  AUTH_GOOGLE_ID: z.string().min(1),
  AUTH_GOOGLE_SECRET: z.string().min(1),

  // Storage (MinIO / S3)
  S3_ENDPOINT: z.string().url(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_BUCKET: z.string().min(1),
  S3_REGION: z.string().default("us-east-1"),

  // Application
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_NAME: z.string().default("StudyHub"),

  // Payment
  NEXT_PUBLIC_TRANSFER_ACCOUNTS: z.string().min(1),

  // Node Environment
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

// Parse and validate current process.env
const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsedEnv.error.flatten().fieldErrors);
  throw new Error("Invalid environment variables");
}

export const env = parsedEnv.data;
