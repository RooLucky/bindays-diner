import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required").url(),
  R2_ACCOUNT_ID: z.string().min(1, "R2_ACCOUNT_ID is required"),
  R2_ACCESS_KEY_ID: z.string().min(1, "R2_ACCESS_KEY_ID is required"),
  R2_SECRET_ACCESS_KEY: z.string().min(1, "R2_SECRET_ACCESS_KEY is required"),
  R2_BUCKET_NAME: z.string().min(1, "R2_BUCKET_NAME is required"),
  R2_ENDPOINT: z.string().url().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),
  S3_ENDPOINT: z.string().url().optional(),
  LOYALTY_STAMP_PIN: z.string().min(4).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  ADMIN_NAME: z.string().min(1).optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_CHATBOT_MODEL: z.string().min(1).default("gpt-4o-mini"),
  OLLAMA_BASE_URL: z.string().url().default("https://ollama.com"),
  OLLAMA_API_KEY: z.string().min(1).optional(),
  OLLAMA_CHATBOT_QWEN: z.string().min(1).optional(),
  OLLAMA_CHATBOT_QWEN3: z.string().min(1).optional(),
  OLLAMA_CHATBOT_KIMI: z.string().min(1).optional(),
  OLLAMA_CHATBOT_KIMI_THINKING: z.string().min(1).optional(),
  OLLAMA_CHATBOT_GLM: z.string().min(1).optional(),
  OLLAMA_CHATBOT_GLM4: z.string().min(1).optional(),
  OLLAMA_CHATBOT_DEEPSEEK: z.string().min(1).optional(),
  OLLAMA_CHATBOT_MINISTRAL: z.string().min(1).optional(),
  OLLAMA_CHATBOT_MINIMAX: z.string().min(1).optional(),
  OLLAMA_CHATBOT_MISTRAL: z.string().min(1).optional(),
  OLLAMA_CHATBOT_RNJ: z.string().min(1).optional(),
  OLLAMA_CHATBOT_NEMOTRON: z.string().min(1).optional(),
  OLLAMA_CHATBOT_DEVSTRAL: z.string().min(1).optional(),
  OLLAMA_CHATBOT_GEMINI: z.string().min(1).optional(),
  OLLAMA_CHATBOT_COGITO: z.string().min(1).optional(),
  OLLAMA_CHATBOT_GEMMA: z.string().min(1).optional(),
  OLLAMA_CHATBOT_MAX_ATTEMPTS: z.coerce.number().int().min(1).max(16).default(4),
  CHATBOT_RATE_LIMIT_SALT: z.string().min(16).optional(),
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
