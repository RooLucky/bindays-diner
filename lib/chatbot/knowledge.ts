import "server-only";

import { and, desc, eq } from "drizzle-orm";

import type { ChatbotHistoryMessage } from "@/lib/chatbot-contracts";
import { getDb } from "@/lib/db";
import { chatbotKnowledgeEntries } from "@/lib/db/schema";

export const CHATBOT_NO_KNOWLEDGE_REPLY =
  "I do not have that information in Bindays Diner's approved knowledge yet. Please ask about the menu, reservations, delivery, promos, or loyalty program, or contact the restaurant directly.";

export type ChatbotKnowledgeEntry =
  typeof chatbotKnowledgeEntries.$inferSelect;

const STOP_WORDS = new Set([
  "a",
  "about",
  "an",
  "and",
  "are",
  "can",
  "do",
  "does",
  "for",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "please",
  "the",
  "to",
  "what",
  "when",
  "where",
  "which",
  "with",
  "you",
]);

function normalize(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function overlapScore(queryTokens: Set<string>, value: string, weight: number) {
  const valueTokens = new Set(tokenize(value));
  let score = 0;

  for (const token of queryTokens) {
    if (valueTokens.has(token)) {
      score += weight;
    }
  }

  return score;
}

function rankEntry(entry: ChatbotKnowledgeEntry, query: string) {
  const normalizedQuery = normalize(query);
  const normalizedQuestion = normalize(entry.question);
  const queryTokens = new Set(tokenize(query));

  if (!normalizedQuery || queryTokens.size === 0) {
    return 0;
  }

  let score = 0;

  if (
    normalizedQuestion.includes(normalizedQuery) ||
    normalizedQuery.includes(normalizedQuestion)
  ) {
    score += 18;
  }

  score += overlapScore(queryTokens, entry.question, 6);
  score += overlapScore(queryTokens, entry.keywords, 5);
  score += overlapScore(queryTokens, entry.category, 3);
  score += overlapScore(queryTokens, entry.answer, 1);

  return score;
}

export async function getRankedChatbotKnowledge(
  message: string,
  history: ChatbotHistoryMessage[],
  limit = 6,
) {
  const entries = await getDb()
    .select()
    .from(chatbotKnowledgeEntries)
    .where(eq(chatbotKnowledgeEntries.isActive, true));
  const currentTokens = tokenize(message);
  const previousUserMessage = [...history]
    .reverse()
    .find((item) => item.role === "user")?.content;
  const retrievalQuery =
    currentTokens.length <= 1 && previousUserMessage
      ? `${previousUserMessage} ${message}`
      : message;

  return entries
    .map((entry) => ({ entry, score: rankEntry(entry, retrievalQuery) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score)
    .slice(0, limit)
    .map((item) => item.entry);
}

export async function getFeaturedChatbotQuestions(limit = 4) {
  return getDb()
    .select({
      id: chatbotKnowledgeEntries.id,
      question: chatbotKnowledgeEntries.question,
    })
    .from(chatbotKnowledgeEntries)
    .where(
      and(
        eq(chatbotKnowledgeEntries.isActive, true),
        eq(chatbotKnowledgeEntries.isFeatured, true),
      ),
    )
    .orderBy(desc(chatbotKnowledgeEntries.updatedAt))
    .limit(limit);
}

export function formatKnowledgeAnswer(entries: ChatbotKnowledgeEntry[]) {
  const answer = entries
    .slice(0, 2)
    .map((entry) => entry.answer.trim())
    .filter(Boolean)
    .join("\n\n");

  if (answer.length <= 1_200) {
    return answer;
  }

  return `${answer.slice(0, 1_197).trimEnd()}...`;
}
