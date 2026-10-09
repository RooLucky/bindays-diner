import "server-only";
import { consumePublicFormLimit, getRequestIp } from "@/lib/chatbot/rate-limit";

export async function requirePublicFormLimit(
  request: Request,
  maximum = 10,
): Promise<Response | null> {
  try {
    const pathname = new URL(request.url).pathname;
    const limit = await consumePublicFormLimit(
      pathname.includes("/payment") ? "payment" : pathname,
      getRequestIp(request) ?? "unknown",
      maximum,
    );
    return limit.allowed
      ? null
      : Response.json(
          { ok: false, error: "Too many requests. Please try again later." },
          {
            status: 429,
            headers: {
              "Retry-After": String(limit.retryAfter),
              "Cache-Control": "no-store",
            },
          },
        );
  } catch {
    return Response.json(
      {
        ok: false,
        error: "Service temporarily unavailable. Please try again later.",
      },
      { status: 503 },
    );
  }
}
