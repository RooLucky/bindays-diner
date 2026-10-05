import { sql } from "drizzle-orm";

import { requireAdminApiSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdminApiSession()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await getDb().execute(sql`select 1`);

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
