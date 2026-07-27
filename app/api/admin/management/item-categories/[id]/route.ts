import { eq } from "drizzle-orm";
import { z } from "zod";

import { requireAdminApiSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { managementItemCategories } from "@/lib/db/schema";
import { toManagementItemCategoryResponse } from "@/lib/management";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const categorySchema = z.object({
  name: z.string().min(1).max(80),
});

function unauthorized() {
  return Response.json({ error: "Unauthorized." }, { status: 401 });
}

async function getCategoryId(context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return id;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  try {
    const id = await getCategoryId(context);
    const input = categorySchema.parse(await request.json());
    const [category] = await getDb()
      .update(managementItemCategories)
      .set({ name: input.name.trim(), updatedAt: new Date() })
      .where(eq(managementItemCategories.id, id))
      .returning();

    if (!category) {
      return Response.json({ error: "Category not found." }, { status: 404 });
    }

    return Response.json({ category: toManagementItemCategoryResponse(category) });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update category.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  try {
    const id = await getCategoryId(context);
    const [category] = await getDb()
      .delete(managementItemCategories)
      .where(eq(managementItemCategories.id, id))
      .returning();

    if (!category) {
      return Response.json({ error: "Category not found." }, { status: 404 });
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to delete category.",
      },
      { status: 400 },
    );
  }
}
