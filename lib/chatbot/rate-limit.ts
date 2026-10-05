import "server-only";

import { createHash } from "node:crypto";

import { sql } from "drizzle-orm";

import { CHATBOT_SESSION_LIMIT } from "@/lib/chatbot-contracts";
import { getDb } from "@/lib/db";
import { chatbotRateLimits } from "@/lib/db/schema";
import { getServerEnv } from "@/lib/env";

const SESSION_WINDOW_MS = 30 * 60 * 1_000;
const IP_WINDOW_MS = 10 * 60 * 1_000;
const IP_LIMIT = 20;

type LimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
};

function hashKey(kind: string, value: string) {
  const env = getServerEnv();
  const salt =
    env.CHATBOT_RATE_LIMIT_SALT ??
    env.OPENAI_API_KEY ??
    env.OLLAMA_API_KEY ??
    "bindays-diner-chatbot-rate-limit";

  return createHash("sha256").update(`${salt}:${kind}:${value}`).digest("hex");
}

async function consumeWindow(
  keyHash: string,
  limit: number,
  windowMs: number,
): Promise<LimitResult> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowMs);
  // One atomic upsert prevents concurrent requests from overwriting the counter.
  const [row] = await getDb()
    .insert(chatbotRateLimits)
    .values({
      keyHash,
      requestCount: 1,
      windowStartedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: chatbotRateLimits.keyHash,
      set: {
        requestCount: sql`case when ${chatbotRateLimits.windowStartedAt} <= ${cutoff.toISOString()}::timestamptz then 1 else least(${chatbotRateLimits.requestCount} + 1, ${limit + 1}) end`,
        windowStartedAt: sql`case when ${chatbotRateLimits.windowStartedAt} <= ${cutoff.toISOString()}::timestamptz then ${now.toISOString()}::timestamptz else ${chatbotRateLimits.windowStartedAt} end`,
        updatedAt: now,
      },
    })
    .returning();
  const allowed = row.requestCount <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - row.requestCount),
    retryAfter: allowed
      ? 0
      : Math.max(
          1,
          Math.ceil(
            (windowMs - (now.getTime() - row.windowStartedAt.getTime())) / 1000,
          ),
        ),
  };
}

// Namespaced counters share the existing durable table; no schema migration is needed.
export async function consumePublicFormLimit(
  scope: string,
  identity: string,
  limit = 10,
) {
  return consumeWindow(
    hashKey(`form:${scope}`, identity),
    limit,
    10 * 60 * 1000,
  );
}

export function getRequestIp(request: Request) {
  const forwarded = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();

  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    forwarded ||
    request.headers.get("x-real-ip")?.trim() ||
    null
  );
}

export async function consumeChatbotRateLimit(
  sessionId: string,
  ipAddress: string | null,
) {
  const sessionResult = await consumeWindow(
    hashKey("session", sessionId),
    CHATBOT_SESSION_LIMIT,
    SESSION_WINDOW_MS,
  );

  if (!sessionResult.allowed || !ipAddress) {
    return sessionResult;
  }

  const ipResult = await consumeWindow(
    hashKey("ip", ipAddress),
    IP_LIMIT,
    IP_WINDOW_MS,
  );

  if (!ipResult.allowed) {
    return ipResult;
  }

  return {
    allowed: true,
    remaining: Math.min(sessionResult.remaining, ipResult.remaining),
    retryAfter: 0,
  };
}
