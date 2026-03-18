import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional().default("development"),
  //PORT حتماً یک عدد مثبت باش
  PORT: z.coerce.number().int().positive().optional().default(4000),
  CORS_ORIGINS: z.string().optional().default("*"),
  LOG_FORMAT: z.string().optional().default("dev"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Keep this a hard fail so misconfig doesn't create subtle runtime issues.
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration:", parsed.error.flatten());
  throw new Error("Invalid environment configuration");
}

const corsOrigins = parsed.data.CORS_ORIGINS.split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export const config = Object.freeze({
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  corsOrigins,
  logFormat: parsed.data.LOG_FORMAT,
});