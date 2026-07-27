import { z } from "zod";

import { requireAdminApiSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { managementItemCategories } from "@/lib/db/schema";
import {
  getManagementItemCategories,
  toManagementItemCategoryResponse,
} from "@/lib/management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const categorySchema = z.object({
  name: z.string().min(1).max(80),
});

function unauthorized() {
  return Response.json({ error: "Unauthorized." }, { status: 401 });
}

export async function GET() {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  return Response.json({ categories: await getManagementItemCategories() });
}

export async function POST(request: Request) {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  try {
    const input = categorySchema.parse(await request.json());
    const [category] = await getDb()
      .insert(managementItemCategories)
      .values({ name: input.name.trim() })
      .onConflictDoUpdate({
        target: managementItemCategories.name,
        set: { name: input.name.trim(), updatedAt: new Date() },
      })
      .returning();

    return Response.json(
      { category: toManagementItemCategoryResponse(category) },
      { status: 201 },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to create category.",
      },
      { status: 400 },
    );
  }
}
