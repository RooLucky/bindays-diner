import { sql } from "drizzle-orm";

import { formatEnvError } from "@/lib/env";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await getDb().execute(sql`select 1`);

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: formatEnvError(error),
      },
      { status: 500 },
    );
  }
}
