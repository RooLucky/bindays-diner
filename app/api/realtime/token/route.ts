import {
  createPublicMenuTokenRequest,
  isAblyRealtimeEnabled,
} from "@/lib/realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAblyRealtimeEnabled()) {
    return Response.json(
      { error: "Realtime updates are not configured." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    return Response.json(await createPublicMenuTokenRequest(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Unable to connect to realtime updates." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
