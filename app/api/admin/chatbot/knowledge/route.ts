import { desc, eq } from "drizzle-orm";
import { ZodError } from "zod";

import { requireAdminApiSession } from "@/lib/admin-auth";
import { chatbotKnowledgeInputSchema } from "@/lib/chatbot-contracts";
import { getDb } from "@/lib/db";
import { chatbotKnowledgeEntries } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return Response.json({ error: "Unauthorized." }, { status: 401 });
}

export async function GET() {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  try {
    const entries = await getDb()
      .select()
      .from(chatbotKnowledgeEntries)
      .orderBy(desc(chatbotKnowledgeEntries.updatedAt));

    return Response.json({ entries });
  } catch {
    return Response.json(
      { error: "Unable to load chatbot knowledge." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  try {
    const input = chatbotKnowledgeInputSchema.parse(await request.json());
    const [duplicate] = await getDb()
      .select({ id: chatbotKnowledgeEntries.id })
      .from(chatbotKnowledgeEntries)
      .where(eq(chatbotKnowledgeEntries.question, input.question))
      .limit(1);

    if (duplicate) {
      return Response.json(
        { error: "That question already exists." },
        { status: 409 },
      );
    }

    const [entry] = await getDb()
      .insert(chatbotKnowledgeEntries)
      .values(input)
      .returning();

    return Response.json({ entry }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Invalid knowledge entry." },
        { status: 400 },
      );
    }

    return Response.json(
      { error: "Unable to create the knowledge entry." },
      { status: 500 },
    );
  }
}
