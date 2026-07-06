import { getLoyaltyCard } from "@/lib/loyalty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ memberCode: string }> },
) {
  const { memberCode } = await context.params;
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

  return Response.json({
    ok: true,
    card,
  });
}

