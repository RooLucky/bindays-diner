import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { loyaltyMembers, loyaltyStamps } from "@/lib/db/schema";
import { verifyLoyaltyStampPin } from "@/lib/admin-settings";
import { getLoyaltyCard, LOYALTY_REWARD_THRESHOLD } from "@/lib/loyalty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const stampSchema = z.object({
  pin: z.string().min(1),
  stampNumber: z.number().int().min(1).max(LOYALTY_REWARD_THRESHOLD),
  note: z.string().optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ memberCode: string }> },
) {
  try {
    const { memberCode } = await context.params;
    const input = stampSchema.parse(await request.json());

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

    if (card.rewardReady) {
      return Response.json(
        {
          ok: false,
          error: "Reward is ready. Redeem this card before adding more stamps.",
        },
        { status: 409 },
      );
    }

    const activeStampedNumbers = card.redeemed ? [] : card.stampedNumbers;
    const nextStampNumber = Array.from(
      { length: LOYALTY_REWARD_THRESHOLD },
      (_, index) => index + 1,
    ).find((stampNumber) => !activeStampedNumbers.includes(stampNumber));

    if (!nextStampNumber) {
      return Response.json(
        {
          ok: false,
          error: "No available stamp number. Redeem this card before adding more stamps.",
        },
        { status: 409 },
      );
    }

    if (input.stampNumber !== nextStampNumber) {
      return Response.json(
        {
          ok: false,
          error: `Only stamp number ${nextStampNumber} can be added next.`,
        },
        { status: 409 },
      );
    }

    const [member] = await getDb()
      .select()
      .from(loyaltyMembers)
      .where(eq(loyaltyMembers.memberCode, memberCode))
      .limit(1);

    const rewardCycle = card.redeemed ? card.currentCycle + 1 : card.currentCycle;

    await getDb().insert(loyaltyStamps).values({
      memberId: member.id,
      rewardCycle,
      stampNumber: nextStampNumber,
      source: "physical",
      note: input.note?.trim() || null,
    });

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
            : "Unable to stamp loyalty card.",
      },
      { status: 400 },
    );
  }
}
