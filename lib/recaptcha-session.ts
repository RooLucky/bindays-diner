import "server-only";
import { cookies } from "next/headers";
import { getServerEnv } from "@/lib/env";
import {
  createRecaptchaSessionToken,
  verifyRecaptchaSessionToken,
} from "@/lib/recaptcha-session-token";

const cookieName = "bd_antibot_session";

export async function hasRecaptchaSession(request: Request) {
  const env = getServerEnv();
  const hostname = new URL(request.url).hostname.toLowerCase();
  const allowed = (env.RECAPTCHA_ALLOWED_HOSTNAMES ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase());
  if (!env.RECAPTCHA_SECRET_KEY || !allowed.includes(hostname)) return false;
  return verifyRecaptchaSessionToken(
    (await cookies()).get(cookieName)?.value,
    env.RECAPTCHA_SECRET_KEY,
    hostname,
  );
}

export async function grantRecaptchaSession(request: Request) {
  const secret = getServerEnv().RECAPTCHA_SECRET_KEY;
  if (!secret) throw new Error("Verification is not configured.");
  // No expires/maxAge: this is a browser-session cookie, not a persistent login.
  (await cookies()).set(
    cookieName,
    createRecaptchaSessionToken(
      secret,
      new URL(request.url).hostname.toLowerCase(),
    ),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api",
    },
  );
}
