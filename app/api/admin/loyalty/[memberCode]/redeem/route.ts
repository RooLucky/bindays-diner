import { and, eq, notExists, sql } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { loyaltyMembers, loyaltyRedemptions } from "@/lib/db/schema";
import { verifyLoyaltyStampPin } from "@/lib/admin-settings";
import { getLoyaltyCard } from "@/lib/loyalty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const redeemSchema = z.object({
  pin: z.string().min(1),
  rewardCycle: z.number().int().positive(),
  note: z.string().optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ memberCode: string }> },
) {
  try {
    const { memberCode } = await context.params;
    const input = redeemSchema.parse(await request.json());

    if (!(await verifyLoyaltyStampPin(input.pin))) {
      return Response.json(
        {
          ok: false,
          error: "Invalid admin PIN.",
        },
        { status: 401 },
      );
    }

    const card = await getLoyaltyCard(memberCode);

    if (!card) {
      return Response.json(
        {
          ok: false,
          error: "Loyalty member not found.",
        },
        { status: 404 },
      );
    }

    if (!card.pendingRewardCycles.includes(input.rewardCycle)) {
      return Response.json(
        {
          ok: false,
          error: "This reward is not available for redemption. Refresh the card.",
        },
        { status: 409 },
      );
    }

    const [member] = await getDb()
      .select()
      .from(loyaltyMembers)
      .where(eq(loyaltyMembers.memberCode, memberCode))
      .limit(1);

    const db = getDb();
    // Serialize redemptions for this member in one Neon HTTP transaction.
    // The second statement sees any redemption committed while waiting for
    // the member lock, so concurrent requests cannot redeem the same reward.
    const [, redemptions] = await db.batch([
      db.update(loyaltyMembers)
        .set({ updatedAt: new Date() })
        .where(eq(loyaltyMembers.id, member.id)),
      db.insert(loyaltyRedemptions).select(
        db.select({
          memberId: loyaltyMembers.id,
          rewardCycle: sql<number>`${input.rewardCycle}::integer`.as("reward_cycle"),
          source: sql`'admin'`.as("source"),
          note: sql`${input.note?.trim() || null}::text`.as("note"),
        }).from(loyaltyMembers).where(and(
          eq(loyaltyMembers.id, member.id),
          notExists(db.select({ id: loyaltyRedemptions.id })
            .from(loyaltyRedemptions)
            .where(and(
              eq(loyaltyRedemptions.memberId, member.id),
              eq(loyaltyRedemptions.rewardCycle, input.rewardCycle),
            ))),
        )),
      ).returning({ id: loyaltyRedemptions.id }),
    ]);

    if (redemptions.length === 0) {
      return Response.json(
        { ok: false, error: "This reward was already redeemed. Refresh the card." },
        { status: 409 },
      );
    }

    const updatedCard = await getLoyaltyCard(memberCode);

    return Response.json({
      ok: true,
      card: updatedCard,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to redeem loyalty card.",
      },
      { status: 400 },
    );
  }
}
