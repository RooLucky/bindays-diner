import "server-only";

import { createHash } from "node:crypto";

import { eq } from "drizzle-orm";

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

function hashKey(kind: "session" | "ip", value: string) {
  const env = getServerEnv();
  const salt =
    env.CHATBOT_RATE_LIMIT_SALT ??
    env.OPENAI_API_KEY ??
    env.OLLAMA_API_KEY ??
    "bindays-diner-chatbot-rate-limit";

  return createHash("sha256")
    .update(`${salt}:${kind}:${value}`)
    .digest("hex");
}

async function consumeWindow(
  keyHash: string,
  limit: number,
  windowMs: number,
): Promise<LimitResult> {
  const db = getDb();
  const now = new Date();
  const [existing] = await db
    .select()
    .from(chatbotRateLimits)
    .where(eq(chatbotRateLimits.keyHash, keyHash))
    .limit(1);

  if (!existing || now.getTime() - existing.windowStartedAt.getTime() >= windowMs) {
    await db
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
          requestCount: 1,
          windowStartedAt: now,
          updatedAt: now,
        },
      });

    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  const retryAfter = Math.max(
    1,
    Math.ceil(
      (windowMs - (now.getTime() - existing.windowStartedAt.getTime())) / 1_000,
    ),
  );

  if (existing.requestCount >= limit) {
    return { allowed: false, remaining: 0, retryAfter };
  }

  const nextCount = existing.requestCount + 1;

  await db
    .update(chatbotRateLimits)
    .set({ requestCount: nextCount, updatedAt: now })
    .where(eq(chatbotRateLimits.keyHash, keyHash));

  return {
    allowed: true,
    remaining: Math.max(0, limit - nextCount),
    retryAfter: 0,
  };
}

export function getRequestIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

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
