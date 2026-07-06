import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export function hashSecret(secret: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(secret, salt, 64).toString("hex");

  return `scrypt:${salt}:${hash}`;
}

export function verifySecret(secret: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split(":");

  if (algorithm !== "scrypt" || !salt || !hash) {
    return false;
  }

  const hashedInput = scryptSync(secret, salt, 64);
  const stored = Buffer.from(hash, "hex");

  return stored.length === hashedInput.length && timingSafeEqual(stored, hashedInput);
}
