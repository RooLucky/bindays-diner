import { ZodError } from "zod";

import { chatbotRequestSchema } from "@/lib/chatbot-contracts";
import {
  CHATBOT_NO_KNOWLEDGE_REPLY,
  formatKnowledgeAnswer,
  getRankedChatbotKnowledge,
} from "@/lib/chatbot/knowledge";
import {
  getChatbotMenuItemsForKnowledge,
  resolveChatbotMenuRecommendation,
} from "@/lib/chatbot/menu-knowledge";
import {
  isMenuHealthComparisonQuestion,
  resolveSelectedEntries,
  selectGroundedKnowledge,
  selectGroundedMenuHealthItems,
} from "@/lib/chatbot/providers";
import {
  consumeChatbotRateLimit,
  getRequestIp,
} from "@/lib/chatbot/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SUBJECTIVE_NEGATIVE_FOOD_PATTERN =
  /\b(disgusting|disgusted|gross|nasty|awful|terrible|worst|inedible|revolting|yuck|hate(?:d)?|bad food)\b/i;
const FOUL_LANGUAGE_PATTERN =
  /(?:\bsh[i1]t(?:ty)?\b|\bf+[\W_]*u+[\W_]*c+[\W_]*k+(?:ing|ed)?\b|\bb[i1]tch\b|\bbullsh[i1]t\b|\basshole\b|\bbastard\b|\bcunt\b|\bd[i1]ck\b|\bputa(?:ng)?\b|\btangina\b|\bgago\b|\bulol\b)/i;

const SUBJECTIVE_NEGATIVE_FOOD_REPLY =
  "Taste is personal, so I would not label any Binday's Diner dish as disgusting. Tell me which ingredients, flavors, textures, or preparation styles you dislike, and I can help you find a better match from the current menu.";
const FOUL_LANGUAGE_REPLY =
  "I can help with the menu, ingredients, promos, reservations, delivery, and loyalty questions. Please rephrase your question without offensive language.";

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

    if (FOUL_LANGUAGE_PATTERN.test(input.message)) {
      return Response.json({
        answer: FOUL_LANGUAGE_REPLY,
        menuItems: [],
        sources: [],
        remaining: rateLimit.remaining,
      });
    }

    if (SUBJECTIVE_NEGATIVE_FOOD_PATTERN.test(input.message)) {
      return Response.json({
        answer: SUBJECTIVE_NEGATIVE_FOOD_REPLY,
        menuItems: [],
        sources: [],
        remaining: rateLimit.remaining,
      });
    }

    const menuRecommendation = isMenuHealthComparisonQuestion(input.message)
      ? null
      : await resolveChatbotMenuRecommendation(input.message);

    if (menuRecommendation) {
      return Response.json({
        ...menuRecommendation,
        sources: [],
        remaining: rateLimit.remaining,
      });
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
    let answer =
      selectedEntries.length > 0
        ? formatKnowledgeAnswer(selectedEntries)
        : CHATBOT_NO_KNOWLEDGE_REPLY;
    let menuItems =
      selectedEntries.length > 0
        ? await getChatbotMenuItemsForKnowledge(
            input.message,
            selectedEntries,
            isMenuHealthComparisonQuestion(input.message) ? 10 : 4,
          )
        : [];
    const healthDecision = await selectGroundedMenuHealthItems(
      input.message,
      menuItems,
    );
    const sources = healthDecision?.sources ?? [];

    if (healthDecision) {
      const selectedIds = new Set(healthDecision.ids);
      const selectedItems = menuItems.filter((item) => selectedIds.has(item.id));

      if (selectedItems.length > 0) {
        menuItems = selectedItems;
        const names = selectedItems.map((item) => item.name);
        const subject =
          names.length === 1
            ? names[0]
            : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
        const grounding =
          healthDecision.provider === "openai-web"
            ? "current general nutrition guidance"
            : "the ingredients and preparation described on our menu";

        answer = `Based on ${grounding}, ${subject} ${names.length === 1 ? "appears" : "appear"} to be the better match for your question among the currently listed dishes. Exact nutrition depends on portions and preparation, so please treat this as a general comparison rather than medical advice.`;
      } else {
        menuItems = menuItems.slice(0, 4);
        answer =
          "I can show the current options, but their descriptions do not include enough nutrition detail to responsibly decide which is healthiest. Please ask the restaurant about ingredients, portions, and preparation.";
      }
    }

    return Response.json({
      answer,
      menuItems,
      sources,
      remaining: rateLimit.remaining,
    });
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
