import { z } from "zod";

import { getDb } from "@/lib/db";
import { loyaltyMembers } from "@/lib/db/schema";
import {
  createMemberCode,
  createQrToken,
  findExistingMember,
  getLoyaltyCard,
  normalizeName,
  normalizePhone,
} from "@/lib/loyalty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const registerSchema = z.object({
  fullName: z.string().min(2),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());
    const existing = await findExistingMember(input);

    if (existing) {
      const card = await getLoyaltyCard(existing.memberCode);

      return Response.json({
        ok: true,
        status: "existing",
        card,
      });
    }

    const [member] = await getDb()
      .insert(loyaltyMembers)
      .values({
        memberCode: createMemberCode(),
        qrToken: createQrToken(),
        fullName: input.fullName.trim().replace(/\s+/g, " "),
        normalizedName: normalizeName(input.fullName),
        birthday: input.birthday,
        phone: input.phone?.trim() || null,
        normalizedPhone: normalizePhone(input.phone),
      })
      .onConflictDoNothing()
      .returning();

    if (!member) {
      const existingAfterConflict = await findExistingMember(input);

      if (existingAfterConflict) {
        const card = await getLoyaltyCard(existingAfterConflict.memberCode);

        return Response.json({
          ok: true,
          status: "existing",
          card,
        });
      }

      return Response.json(
        {
          ok: false,
          error: "Unable to create loyalty member.",
        },
        { status: 409 },
      );
    }

    const card = await getLoyaltyCard(member.memberCode);

    return Response.json({
      ok: true,
      status: "created",
      card,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to register loyalty member.",
      },
      { status: 400 },
    );
  }
}
