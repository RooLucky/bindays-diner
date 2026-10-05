import { requireAdminApiSession } from "@/lib/admin-auth";
import { readAdminOrders } from "@/lib/admin-orders";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!(await requireAdminApiSession()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return Response.json(
      await readAdminOrders(new URL(request.url).searchParams),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Unable to load orders." }, { status: 500 });
  }
}
