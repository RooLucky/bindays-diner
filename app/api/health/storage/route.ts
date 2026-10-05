import { requireAdminApiSession } from "@/lib/admin-auth";
import { checkR2Bucket } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdminApiSession()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await checkR2Bucket();

    return Response.json({ ok: true });
  } catch {
    return Response.json(
      {
        ok: false,
        error: "Service unavailable.",
      },
      { status: 500 },
    );
  }
}
