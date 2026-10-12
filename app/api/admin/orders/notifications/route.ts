import { requireAdminApiSession } from "@/lib/admin-auth";
import { readOrderNotifications } from "@/lib/admin-order-notifications";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!(await requireAdminApiSession()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const since = new URL(request.url).searchParams.get("since");
  if (
    since &&
    (since.length > 64 ||
      !/^\d{4}-\d{2}-\d{2}[T ]/.test(since) ||
      !Number.isFinite(Date.parse(since)))
  ) {
    return Response.json({ error: "Invalid read marker." }, { status: 400 });
  }
  try {
    const result = await readOrderNotifications(since);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json(
      { error: "Unable to check notifications." },
      { status: 503 },
    );
  }
}
