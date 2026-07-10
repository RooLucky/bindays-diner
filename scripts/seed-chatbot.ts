import "dotenv/config";

import { DEFAULT_CHATBOT_KNOWLEDGE } from "@/lib/chatbot/default-knowledge";
import { getDb } from "@/lib/db";
import { chatbotKnowledgeEntries } from "@/lib/db/schema";

async function seedChatbot() {
  const rows = await getDb()
    .insert(chatbotKnowledgeEntries)
    .values(
      DEFAULT_CHATBOT_KNOWLEDGE.map((entry) => ({
        ...entry,
        isActive: true,
      })),
    )
    .onConflictDoNothing({ target: chatbotKnowledgeEntries.question })
    .returning({ id: chatbotKnowledgeEntries.id });

  console.log(`Seeded ${rows.length} new chatbot knowledge entries.`);
}

seedChatbot().catch((error) => {
  console.error(error);
  process.exit(1);
});
