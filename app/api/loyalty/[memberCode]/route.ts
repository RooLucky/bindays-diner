import { hasLoyaltyAccess } from "@/lib/loyalty-access";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { getLoyaltyCard } from "@/lib/loyalty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ memberCode: string }> },
) {
  const { memberCode } = await context.params;
  if (
    !(await hasLoyaltyAccess(memberCode)) &&
    !(await requireAdminApiSession())
  )
    return Response.json(
      { ok: false, error: "Please search for your loyalty card again." },
      { status: 401 },
    );
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
