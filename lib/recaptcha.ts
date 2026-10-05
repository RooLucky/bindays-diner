import { consumePublicFormLimit, getRequestIp } from "@/lib/chatbot/rate-limit";
import "server-only";
import { getServerEnv } from "@/lib/env";
import { verifyRecaptchaToken } from "@/lib/recaptcha-verification";

export async function requireRecaptcha(
  request: Request,
): Promise<Response | null> {
  const reject = (error: string, status: number) =>
    Response.json(
      { ok: false, error },
      { status, headers: { "Cache-Control": "no-store" } },
    );
  // Verify before reading uploads, querying the database, or sending email.
  const token = request.headers.get("x-recaptcha-token");
  if (!token || token.length > 4096)
    return reject("Complete the reCAPTCHA verification and try again.", 403);
  try {
    const env = getServerEnv();
    const hostnames = (env.RECAPTCHA_ALLOWED_HOSTNAMES ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean);
    if (!env.RECAPTCHA_SECRET_KEY || !hostnames.length) {
      return reject(
        "Verification is not configured. Please contact the restaurant.",
        503,
      );
    }
    if (!hostnames.includes(new URL(request.url).hostname.toLowerCase())) {
      return reject(
        "This website hostname is not configured for verification.",
        403,
      );
    }
    if (
      !(await verifyRecaptchaToken(token, {
        secret: env.RECAPTCHA_SECRET_KEY,
        hostnames,
      }))
    ) {
      return reject(
        "Verification failed or expired. Please complete reCAPTCHA again.",
        403,
      );
    }
    const pathname = new URL(request.url).pathname;
    const scope = pathname.includes("/payment") ? "payment" : pathname;
    const limit = await consumePublicFormLimit(
      scope,
      getRequestIp(request) ?? "unknown",
      pathname.endsWith("/chatbot") ? 20 : 10,
    );
    if (!limit.allowed)
      return Response.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(limit.retryAfter),
            "Cache-Control": "no-store",
          },
        },
      );
    return null;
  } catch {
    return reject(
      "Verification is temporarily unavailable. Please try again later.",
      503,
    );
  }
}
