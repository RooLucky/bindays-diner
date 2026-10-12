import { requireAdminApiSession } from "@/lib/admin-auth";
import {
  createAdminOrdersTokenRequest,
  isAblyRealtimeEnabled,
} from "@/lib/realtime";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  const user = await requireAdminApiSession();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    if (!isAblyRealtimeEnabled())
      return Response.json(
        { error: "Realtime is not configured." },
        { status: 503 },
      );
    return Response.json(await createAdminOrdersTokenRequest(user.id), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Realtime is unavailable." },
      { status: 503 },
    );
  }
}
