import { getHeaderNavigationVisibility } from "@/lib/header-navigation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const navigationVisibility = await getHeaderNavigationVisibility();

  return Response.json(
    { navigationVisibility },
    { headers: { "Cache-Control": "no-store" } },
  );
}
