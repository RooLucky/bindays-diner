import { grantLoyaltyAccess } from "@/lib/loyalty-access";
import {
  PublicRequestError,
  readLimitedBody,
} from "@/lib/public-request-error";
import { requireRecaptcha } from "@/lib/recaptcha";
import { ZodError } from "zod";
import { loyaltyRegistrationSchema } from "@/lib/loyalty-registration";

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

export async function POST(request: Request) {
  const captchaError = await requireRecaptcha(request);
  if (captchaError) return captchaError;
  try {
    const input = loyaltyRegistrationSchema.parse(
      await (await readLimitedBody(request)).json(),
    );
    const existing = await findExistingMember(input);

    if (existing) {
      const card = await getLoyaltyCard(existing.memberCode);
      await grantLoyaltyAccess(existing.memberCode);

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
        await grantLoyaltyAccess(existingAfterConflict.memberCode);

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
    await grantLoyaltyAccess(member.memberCode);

    return Response.json({
      ok: true,
      status: "created",
      card,
    });
  } catch (error) {
    if (error instanceof ZodError)
      return Response.json(
        {
          ok: false,
          error: error.issues[0]?.message ?? "Check your registration details.",
        },
        { status: 400 },
      );
    return Response.json(
      {
        ok: false,
        error: "Unable to register loyalty member.",
      },
      { status: 400 },
    );
  }
}
