import "server-only";

import { desc } from "drizzle-orm";

import { getDb } from "@/lib/db";
import {
  loyaltyMembers,
  loyaltyRedemptions,
  loyaltyStamps,
} from "@/lib/db/schema";
import { getLoyaltyProgress } from "@/lib/loyalty-progress";

export type AdminLoyaltyRegistration = {
  memberCode: string;
  fullName: string;
  birthday: string;
  phone: string | null;
  createdAt: string;
  currentCycle: number;
  stampCount: number;
  rewardThreshold: number;
  rewardReady: boolean;
  pendingRewardCount: number;
  redeemedRewardCount: number;
  lastActivityAt: string | null;
};

function toIsoString(value: Date | null | undefined) {
  return value ? value.toISOString() : null;
}

export async function listAdminLoyaltyRegistrations(): Promise<
  AdminLoyaltyRegistration[]
> {
  const db = getDb();
  const members = await db
    .select({
      id: loyaltyMembers.id,
      memberCode: loyaltyMembers.memberCode,
      fullName: loyaltyMembers.fullName,
      birthday: loyaltyMembers.birthday,
      phone: loyaltyMembers.phone,
      createdAt: loyaltyMembers.createdAt,
    })
    .from(loyaltyMembers)
    .orderBy(desc(loyaltyMembers.createdAt));
  const stamps = await db
    .select({
      memberId: loyaltyStamps.memberId,
      rewardCycle: loyaltyStamps.rewardCycle,
      stampNumber: loyaltyStamps.stampNumber,
      createdAt: loyaltyStamps.createdAt,
    })
    .from(loyaltyStamps);
  const redemptions = await db
    .select({
      memberId: loyaltyRedemptions.memberId,
      rewardCycle: loyaltyRedemptions.rewardCycle,
      createdAt: loyaltyRedemptions.createdAt,
    })
    .from(loyaltyRedemptions);

  const stampsByMember = new Map<string, typeof stamps>();
  const redemptionsByMember = new Map<string, typeof redemptions>();

  for (const stamp of stamps) {
    const memberStamps = stampsByMember.get(stamp.memberId) ?? [];
    memberStamps.push(stamp);
    stampsByMember.set(stamp.memberId, memberStamps);
  }

  for (const redemption of redemptions) {
    const memberRedemptions = redemptionsByMember.get(redemption.memberId) ?? [];
    memberRedemptions.push(redemption);
    redemptionsByMember.set(redemption.memberId, memberRedemptions);
  }

  return members.map((member) => {
    const memberStamps = stampsByMember.get(member.id) ?? [];
    const memberRedemptions = redemptionsByMember.get(member.id) ?? [];
    const latestActivity = [...memberStamps, ...memberRedemptions]
      .map((activity) => activity.createdAt)
      .sort((first, second) => second.getTime() - first.getTime())[0];

    return {
      memberCode: member.memberCode,
      fullName: member.fullName,
      birthday: member.birthday,
      phone: member.phone,
      createdAt: member.createdAt.toISOString(),
      ...getLoyaltyProgress(memberStamps, memberRedemptions),
      lastActivityAt: toIsoString(latestActivity),
    };
  });
}
