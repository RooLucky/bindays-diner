import { clearAdminSession, requireAdminApiSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await requireAdminApiSession()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  await clearAdminSession();

  return Response.json({ ok: true });
}
