import { ZodError } from "zod";

import { chatbotRequestSchema } from "@/lib/chatbot-contracts";
import {
  CHATBOT_NO_KNOWLEDGE_REPLY,
  formatKnowledgeAnswer,
  getRankedChatbotKnowledge,
} from "@/lib/chatbot/knowledge";
import {
  resolveSelectedEntries,
  selectGroundedKnowledge,
} from "@/lib/chatbot/providers";
import {
  consumeChatbotRateLimit,
  getRequestIp,
} from "@/lib/chatbot/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = chatbotRequestSchema.parse(await request.json());
    const rateLimit = await consumeChatbotRateLimit(
      input.sessionId,
      getRequestIp(request),
    );

    if (!rateLimit.allowed) {
      return Response.json(
        {
          error: "Chat limit reached. Please try again later.",
          retryAfter: rateLimit.retryAfter,
        },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        },
      );
    }

    const rankedEntries = await getRankedChatbotKnowledge(
      input.message,
      input.history,
    );

    if (rankedEntries.length === 0) {
      return Response.json({
        answer: CHATBOT_NO_KNOWLEDGE_REPLY,
        remaining: rateLimit.remaining,
      });
    }

    const selection = await selectGroundedKnowledge(
      input.message,
      input.history,
      rankedEntries,
    );
    const selectedEntries = resolveSelectedEntries(selection.ids, rankedEntries);
    const answer =
      selectedEntries.length > 0
        ? formatKnowledgeAnswer(selectedEntries)
        : CHATBOT_NO_KNOWLEDGE_REPLY;

    return Response.json({ answer, remaining: rateLimit.remaining });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Invalid chatbot request." },
        { status: 400 },
      );
    }

    return Response.json(
      { error: "The chatbot is temporarily unavailable." },
      { status: 503 },
    );
  }
}
