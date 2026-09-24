import { and, asc, eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { loyaltyMembers, loyaltyRedemptions, loyaltyStamps } from "@/lib/db/schema";
import { getLoyaltyProgress } from "@/lib/loyalty-progress";

export { LOYALTY_REWARD_THRESHOLD } from "@/lib/loyalty-progress";
export const LOYALTY_QR_BASE_URL = "https://www.bindaysdiner.com";

export type LoyaltyCard = Awaited<ReturnType<typeof getLoyaltyCard>>;

export function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

export function normalizePhone(value?: string | null) {
  const normalized = value?.replace(/[^\d+]/g, "").trim();
  return normalized || null;
}

export function createMemberCode() {
  return `BD-${crypto.randomUUID().replace(/-/g, "").slice(0, 12).toUpperCase()}`;
}

export function createQrToken() {
  return crypto.randomUUID().replace(/-/g, "");
}

export function getPublicBaseUrl() {
  return LOYALTY_QR_BASE_URL;
}

export function getMemberQrUrl(memberCode: string) {
  return `${getPublicBaseUrl()}/admin/loyalty/scan/${encodeURIComponent(memberCode)}`;
}

export async function getLoyaltyCard(memberCode: string) {
  const db = getDb();
  const [member] = await db
    .select()
    .from(loyaltyMembers)
    .where(eq(loyaltyMembers.memberCode, memberCode))
    .limit(1);

  if (!member) {
    return null;
  }

  const stamps = await db
    .select()
    .from(loyaltyStamps)
    .where(eq(loyaltyStamps.memberId, member.id))
    .orderBy(asc(loyaltyStamps.createdAt));

  const redemptions = await db
    .select()
    .from(loyaltyRedemptions)
    .where(eq(loyaltyRedemptions.memberId, member.id))
    .orderBy(asc(loyaltyRedemptions.createdAt));

  return {
    member: {
      memberCode: member.memberCode,
      fullName: member.fullName,
      birthday: member.birthday,
      phone: member.phone,
      createdAt: member.createdAt,
    },
    qrUrl: getMemberQrUrl(member.memberCode),
    ...getLoyaltyProgress(stamps, redemptions),
    recentStamps: stamps
      .slice(-5)
      .reverse()
      .map((stamp) => ({
        id: stamp.id,
        stampNumber: stamp.stampNumber,
        rewardCycle: stamp.rewardCycle,
        source: stamp.source,
        note: stamp.note,
        createdAt: stamp.createdAt,
      })),
  };
}

export async function findExistingMember(input: {
  fullName: string;
  birthday: string;
  phone?: string | null;
}) {
  const db = getDb();
  const normalizedName = normalizeName(input.fullName);
  const normalizedPhone = normalizePhone(input.phone);

  const phoneMatches = normalizedPhone
    ? await db
        .select()
        .from(loyaltyMembers)
        .where(eq(loyaltyMembers.normalizedPhone, normalizedPhone))
        .limit(1)
    : [];

  if (phoneMatches[0]) {
    return phoneMatches[0];
  }

  const [nameBirthdayMatch] = await db
    .select()
    .from(loyaltyMembers)
    .where(
      and(
        eq(loyaltyMembers.normalizedName, normalizedName),
        eq(loyaltyMembers.birthday, input.birthday),
      ),
    )
    .limit(1);

  return nameBirthdayMatch ?? null;
}
