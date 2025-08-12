import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

    DATABASE_URL: z.string().url(),
    DIRECT_URL: z.string().url().optional(),

    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),
    AUTH_TRUST_HOST: z.coerce.boolean().optional(),

    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),

    EMAIL_ENCRYPT_SECRET: z.string().min(1),
    EMAIL_ENCRYPT_SALT: z.string().min(1),

    OPENROUTER_API_KEY: z.string().optional(),
    MISTRAL_API_KEY: z.string().optional(),
  },
  client: {},
  experimental__runtimeEnv: {},
});
