import { asc } from "drizzle-orm";
import { z } from "zod";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { mealFlavors } from "@/lib/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdminApiSession())) return new Response(null, { status: 401 });
  try {
    const flavors = await getDb().select({ id: mealFlavors.id, name: mealFlavors.name }).from(mealFlavors).orderBy(asc(mealFlavors.name));
    return Response.json({ flavors }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Unable to load flavors." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  if (!(await requireAdminApiSession())) return new Response(null, { status: 401 });
  try {
    const { name } = z.object({ name: z.string().trim().min(1).max(80) }).parse(await request.json());
    const normalizedName = name.toLowerCase();
    const [flavor] = await getDb().insert(mealFlavors).values({ name, normalizedName })
      .onConflictDoUpdate({ target: mealFlavors.normalizedName, set: { normalizedName } })
      .returning({ id: mealFlavors.id, name: mealFlavors.name });
    return Response.json({ flavor }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof z.ZodError ? "Enter a flavor name of 1–80 characters." : "Unable to save flavor." }, { status: 400 });
  }
}
