import { eq } from "drizzle-orm";
import { z } from "zod";

import { getDb } from "@/lib/db";
import { loyaltyMembers, loyaltyRedemptions } from "@/lib/db/schema";
import { verifyLoyaltyStampPin } from "@/lib/admin-settings";
import { getLoyaltyCard } from "@/lib/loyalty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const redeemSchema = z.object({
  pin: z.string().min(1),
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

    if (!card.rewardReady) {
      return Response.json(
        {
          ok: false,
          error: "This loyalty card is not ready for redemption.",
        },
        { status: 409 },
      );
    }

    const [member] = await getDb()
      .select()
      .from(loyaltyMembers)
      .where(eq(loyaltyMembers.memberCode, memberCode))
      .limit(1);

    await getDb().insert(loyaltyRedemptions).values({
      memberId: member.id,
      rewardCycle: card.currentCycle,
      source: "admin",
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
            : "Unable to redeem loyalty card.",
      },
      { status: 400 },
    );
  }
}
