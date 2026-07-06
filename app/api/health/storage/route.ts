import { formatEnvError } from "@/lib/env";
import { checkR2Bucket } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await checkR2Bucket();

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
