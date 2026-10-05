import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getServerEnv } from "@/lib/env";

const name = "bd_loyalty_access";
function sign(value: string) {
  const secret = getServerEnv().RECAPTCHA_SECRET_KEY;
  if (!secret) throw new Error("Loyalty access is not configured.");
  return createHmac("sha256", secret).update(`loyalty:${value}`).digest("hex");
}
export async function grantLoyaltyAccess(memberCode: string) {
  const maxAge = 24 * 60 * 60;
  const value = `${memberCode}.${Date.now() + maxAge * 1000}`;
  (await cookies()).set(name, `${value}.${sign(value)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api/loyalty",
    maxAge,
  });
}
export async function hasLoyaltyAccess(memberCode: string) {
  const cookie = (await cookies()).get(name)?.value;
  if (!cookie) return false;
  const [code, expiry, signature, extra] = cookie.split(".");
  if (
    extra ||
    code !== memberCode ||
    !/^\d+$/.test(expiry ?? "") ||
    Number(expiry) <= Date.now() ||
    !/^[a-f0-9]{64}$/.test(signature ?? "")
  )
    return false;
  try {
    return timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(sign(`${code}.${expiry}`), "hex"),
    );
  } catch {
    return false;
  }
}
