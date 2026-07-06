import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").url(),
  R2_ACCOUNT_ID: z.string().min(1, "R2_ACCOUNT_ID is required"),
  R2_ACCESS_KEY_ID: z.string().min(1, "R2_ACCESS_KEY_ID is required"),
  R2_SECRET_ACCESS_KEY: z.string().min(1, "R2_SECRET_ACCESS_KEY is required"),
  R2_BUCKET_NAME: z.string().min(1, "R2_BUCKET_NAME is required"),
  R2_ENDPOINT: z.string().url().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  LOYALTY_STAMP_PIN: z.string().min(4).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  ADMIN_NAME: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema> & {
  R2_ENDPOINT: string;
};

export function getServerEnv(): ServerEnv {
  if (typeof window !== "undefined") {
    throw new Error("Server environment variables cannot be read in the browser.");
  }

  const parsed = serverEnvSchema.parse(process.env);
  const r2Endpoint =
    parsed.R2_ENDPOINT ??
    parsed.S3_ENDPOINT ??
    `https://${parsed.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

  return {
    ...parsed,
    R2_ENDPOINT: r2Endpoint,
  };
}

export function formatEnvError(error: unknown) {
  if (error instanceof z.ZodError) {
    return {
      message: "Server environment is not configured correctly.",
      issues: error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    };
  }

  return {
    message: error instanceof Error ? error.message : "Unexpected server error.",
  };
}
