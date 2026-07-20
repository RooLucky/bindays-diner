import { z } from "zod";

export const CHATBOT_MESSAGE_MAX_LENGTH = 400;
export const CHATBOT_HISTORY_MAX_MESSAGES = 6;
export const CHATBOT_SESSION_LIMIT = 12;

export type ChatbotMenuItem = {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  imageAlt: string;
  categorySlug: string;
  href: string;
};

export const chatbotHistoryMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(1_200),
});

export const chatbotRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Enter a question.")
    .max(
      CHATBOT_MESSAGE_MAX_LENGTH,
      `Questions are limited to ${CHATBOT_MESSAGE_MAX_LENGTH} characters.`,
    ),
  sessionId: z
    .string()
    .trim()
    .min(16)
    .max(100)
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid chatbot session."),
  history: z
    .array(chatbotHistoryMessageSchema)
    .max(CHATBOT_HISTORY_MAX_MESSAGES)
    .default([]),
});

export const chatbotKnowledgeInputSchema = z.object({
  question: z.string().trim().min(3).max(240),
  answer: z.string().trim().min(3).max(3_000),
  keywords: z.string().trim().max(600).default(""),
  category: z.string().trim().min(2).max(80).default("General"),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const chatbotKnowledgeUpdateSchema = chatbotKnowledgeInputSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update.",
  });

export type ChatbotHistoryMessage = z.infer<
  typeof chatbotHistoryMessageSchema
>;
export type ChatbotKnowledgeInput = z.infer<
  typeof chatbotKnowledgeInputSchema
>;
