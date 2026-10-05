import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

function signature(value: string, secret: string, hostname: string) {
  return createHmac("sha256", secret)
    .update(`recaptcha-session:${hostname}:${value}`)
    .digest("hex");
}

export function createRecaptchaSessionToken(secret: string, hostname: string) {
  const value = `v1.${randomBytes(32).toString("hex")}`;
  return `${value}.${signature(value, secret, hostname)}`;
}

export function verifyRecaptchaSessionToken(
  token: string | undefined,
  secret: string,
  hostname: string,
) {
  if (!secret || !token || !/^v1\.[a-f0-9]{64}\.[a-f0-9]{64}$/.test(token))
    return false;
  const [version, nonce, signed] = token.split(".");
  return timingSafeEqual(
    Buffer.from(signed, "hex"),
    Buffer.from(signature(`${version}.${nonce}`, secret, hostname), "hex"),
  );
}
