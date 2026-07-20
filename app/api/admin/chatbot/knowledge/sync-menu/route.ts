import { requireAdminApiSession } from "@/lib/admin-auth";
import { syncAllChatbotMenuKnowledge } from "@/lib/chatbot/menu-knowledge";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await requireAdminApiSession())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const entries = await syncAllChatbotMenuKnowledge();

    return Response.json({ entries });
  } catch {
    return Response.json(
      { error: "Unable to sync menu knowledge." },
      { status: 500 },
    );
  }
}
