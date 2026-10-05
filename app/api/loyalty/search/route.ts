import { grantLoyaltyAccess } from "@/lib/loyalty-access";
import {
  PublicRequestError,
  readLimitedBody,
} from "@/lib/public-request-error";
import { requireRecaptcha } from "@/lib/recaptcha";
import { ZodError } from "zod";
import { loyaltyRegistrationSchema } from "@/lib/loyalty-registration";

import { findExistingMember, getLoyaltyCard } from "@/lib/loyalty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const captchaError = await requireRecaptcha(request);
  if (captchaError) return captchaError;
  try {
    const input = loyaltyRegistrationSchema.parse(
      await (await readLimitedBody(request)).json(),
    );
    const member = await findExistingMember(input);

    if (!member) {
      return Response.json(
        {
          ok: false,
          error: "No loyalty account found.",
        },
        { status: 404 },
      );
    }

    const card = await getLoyaltyCard(member.memberCode);
    await grantLoyaltyAccess(member.memberCode);

    return Response.json({
      ok: true,
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
        error: "Unable to search loyalty member.",
      },
      { status: 400 },
    );
  }
}
