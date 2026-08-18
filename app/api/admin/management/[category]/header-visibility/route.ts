import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAdminApiSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { managementCategories } from "@/lib/db/schema";
import { isHeaderManagedCategorySlug } from "@/lib/header-navigation-contracts";
import { requireManagementCategorySlug } from "@/lib/management";
import { notifyPublicMenuContentUpdated } from "@/lib/realtime";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return Response.json({ error: "Unauthorized." }, { status: 401 });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ category: string }> },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  try {
    const { category } = await context.params;
    const slug = requireManagementCategorySlug(category);

    if (!isHeaderManagedCategorySlug(slug)) {
      return Response.json(
        { error: "This category cannot be managed in the public header." },
        { status: 400 },
      );
    }

    const body = (await request.json()) as { isHeaderActive?: unknown };

    if (typeof body.isHeaderActive !== "boolean") {
      return Response.json(
        { error: "isHeaderActive must be a boolean." },
        { status: 400 },
      );
    }

    const [updatedCategory] = await getDb()
      .update(managementCategories)
      .set({
        isHeaderActive: body.isHeaderActive,
        updatedAt: new Date(),
      })
      .where(eq(managementCategories.slug, slug))
      .returning({
        slug: managementCategories.slug,
        isHeaderActive: managementCategories.isHeaderActive,
      });

    if (!updatedCategory) {
      return Response.json(
        { error: "Management category not found." },
        { status: 404 },
      );
    }

    revalidatePath("/", "layout");
    await notifyPublicMenuContentUpdated(slug);

    return Response.json(updatedCategory);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to update header visibility.",
      },
      { status: 400 },
    );
  }
}
