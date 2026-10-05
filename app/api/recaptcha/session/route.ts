import { hasRecaptchaSession } from "@/lib/recaptcha-session";
import { requireRecaptcha } from "@/lib/recaptcha";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    return Response.json(
      { verified: await hasRecaptchaSession(request) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json(
      { verified: false },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

export async function POST(request: Request) {
  const error = await requireRecaptcha(request);
  if (error) return error;
  return Response.json(
    { verified: true },
    { headers: { "Cache-Control": "no-store" } },
  );
}
