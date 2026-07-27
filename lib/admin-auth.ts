import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getDb } from "@/lib/db";
import { adminAccounts, adminSessions } from "@/lib/db/schema";
import { verifySecret } from "@/lib/secrets";

export const ADMIN_SESSION_COOKIE = "bd_admin_session";
const SESSION_DAYS = 7;

export type AdminSessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: "owner" | "admin";
};

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function getSessionExpiry() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  return expiresAt;
}

export async function verifyAdminCredentials(email: string, password: string) {
  const [account] = await getDb()
    .select()
    .from(adminAccounts)
    .where(eq(adminAccounts.email, email.trim().toLowerCase()))
    .limit(1);

  if (!account || !verifySecret(password, account.passwordHash)) {
    return null;
  }

  return account;
}

export async function createAdminSession(adminAccountId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = getSessionExpiry();

  await getDb().insert(adminSessions).values({
    adminAccountId,
    tokenHash: hashToken(token),
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    await getDb()
      .delete(adminSessions)
      .where(eq(adminSessions.tokenHash, hashToken(token)));
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}

export async function getAdminSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  await getDb().delete(adminSessions).where(lt(adminSessions.expiresAt, new Date()));

  const [row] = await getDb()
    .select({
      id: adminAccounts.id,
      email: adminAccounts.email,
      fullName: adminAccounts.fullName,
      role: adminAccounts.role,
    })
    .from(adminSessions)
    .innerJoin(
      adminAccounts,
      eq(adminSessions.adminAccountId, adminAccounts.id),
    )
    .where(
      and(
        eq(adminSessions.tokenHash, hashToken(token)),
        gt(adminSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function requireAdminSession() {
  const user = await getAdminSessionUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireAdminApiSession() {
  const user = await getAdminSessionUser();

  if (!user) {
    return null;
  }

  return user;
}
