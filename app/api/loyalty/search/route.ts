import { z } from "zod";

import { findExistingMember, getLoyaltyCard } from "@/lib/loyalty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const searchSchema = z.object({
  fullName: z.string().min(2),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  phone: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const input = searchSchema.parse(await request.json());
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

    return Response.json({
      ok: true,
      card,
    });
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to search loyalty member.",
      },
      { status: 400 },
    );
  }
}

