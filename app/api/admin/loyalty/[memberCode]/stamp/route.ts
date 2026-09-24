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
  rewardCycle: z.number().int().positive(),
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

    if (input.rewardCycle !== card.currentCycle) {
      return Response.json(
        {
          ok: false,
          error: "This card has started a new cycle. Refresh the card before adding a stamp.",
        },
        { status: 409 },
      );
    }

    const nextStampNumber = Array.from(
      { length: LOYALTY_REWARD_THRESHOLD },
      (_, index) => index + 1,
    ).find((stampNumber) => !card.stampedNumbers.includes(stampNumber));

    if (!nextStampNumber) {
      return Response.json(
        {
          ok: false,
          error: "This card has changed. Refresh the card before adding a stamp.",
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

    const [stamp] = await getDb().insert(loyaltyStamps).values({
      memberId: member.id,
      rewardCycle: card.currentCycle,
      stampNumber: nextStampNumber,
      source: "physical",
      note: input.note?.trim() || null,
    }).onConflictDoNothing().returning({ id: loyaltyStamps.id });

    if (!stamp) {
      return Response.json(
        { ok: false, error: "This stamp was already added. Refresh the card." },
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
            : "Unable to stamp loyalty card.",
      },
      { status: 400 },
    );
  }
}
