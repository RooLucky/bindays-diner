import { eq } from "drizzle-orm";
import { ZodError } from "zod";

import { requireAdminApiSession } from "@/lib/admin-auth";
import { chatbotKnowledgeUpdateSchema } from "@/lib/chatbot-contracts";
import { getDb } from "@/lib/db";
import { chatbotKnowledgeEntries } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return Response.json({ error: "Unauthorized." }, { status: 401 });
}

async function getId(context: { params: Promise<{ id: string }> }) {
  return (await context.params).id;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  try {
    const id = await getId(context);
    const input = chatbotKnowledgeUpdateSchema.parse(await request.json());
    const [entry] = await getDb()
      .update(chatbotKnowledgeEntries)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(chatbotKnowledgeEntries.id, id))
      .returning();

    if (!entry) {
      return Response.json(
        { error: "Knowledge entry not found." },
        { status: 404 },
      );
    }

    return Response.json({ entry });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: error.issues[0]?.message ?? "Invalid knowledge entry." },
        { status: 400 },
      );
    }

    return Response.json(
      { error: "Unable to update the knowledge entry." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  try {
    const id = await getId(context);
    const [entry] = await getDb()
      .delete(chatbotKnowledgeEntries)
      .where(eq(chatbotKnowledgeEntries.id, id))
      .returning({ id: chatbotKnowledgeEntries.id });

    if (!entry) {
      return Response.json(
        { error: "Knowledge entry not found." },
        { status: 404 },
      );
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      { error: "Unable to delete the knowledge entry." },
      { status: 500 },
    );
  }
}
