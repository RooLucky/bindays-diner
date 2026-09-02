import { requireAdminApiSession } from "@/lib/admin-auth";
import { listAdminLoyaltyRegistrations } from "@/lib/admin-loyalty";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return Response.json({ error: "Unauthorized." }, { status: 401 });
}

export async function GET() {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  return Response.json({
    registrations: await listAdminLoyaltyRegistrations(),
  });
}
