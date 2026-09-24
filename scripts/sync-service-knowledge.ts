import "dotenv/config";

import { SERVICE_CHATBOT_KNOWLEDGE } from "@/lib/chatbot/service-knowledge";
import { getDb } from "@/lib/db";
import { chatbotKnowledgeEntries } from "@/lib/db/schema";

async function syncServiceKnowledge() {
  const db = getDb();
  for (const entry of SERVICE_CHATBOT_KNOWLEDGE) {
    await db.insert(chatbotKnowledgeEntries)
      .values({ ...entry, isActive: true })
      .onConflictDoUpdate({
        target: chatbotKnowledgeEntries.question,
        set: {
          answer: entry.answer,
          keywords: entry.keywords,
          category: entry.category,
          isActive: true,
          updatedAt: new Date(),
        },
      });
  }
  console.log(`Updated ${SERVICE_CHATBOT_KNOWLEDGE.length} approved contact and loyalty knowledge entries.`);
}

syncServiceKnowledge().catch(() => {
  console.error("Unable to update service knowledge. Check the server environment and database connection.");
  process.exit(1);
});
