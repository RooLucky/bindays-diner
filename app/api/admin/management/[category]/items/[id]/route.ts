import { and, eq } from "drizzle-orm";

import { requireAdminApiSession } from "@/lib/admin-auth";
import { trySyncChatbotMenuKnowledgeForCategory } from "@/lib/chatbot/menu-knowledge";
import { getDb } from "@/lib/db";
import { managementItems } from "@/lib/db/schema";
import {
  requireManagementCategorySlug,
  toManagementItemResponse,
} from "@/lib/management";
import { notifyPublicMenuContentUpdated } from "@/lib/realtime";
import { deleteR2Object } from "@/lib/r2";
import {
  getOptionalBoolean,
  getOptionalInteger,
  getOptionalString,
  getRequiredString,
  getSingleImageFile,
  replaceManagementImage,
} from "@/lib/management-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return Response.json({ error: "Unauthorized." }, { status: 401 });
}

async function getParams(context: {
  params: Promise<{ category: string; id: string }>;
}) {
  const { category, id } = await context.params;
  return {
    categorySlug: requireManagementCategorySlug(category),
    id,
  };
}

async function findItem(categorySlug: string, id: string) {
  const [item] = await getDb()
    .select()
    .from(managementItems)
    .where(and(eq(managementItems.categorySlug, categorySlug), eq(managementItems.id, id)))
    .limit(1);

  return item ?? null;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ category: string; id: string }> },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  try {
    const { categorySlug, id } = await getParams(context);
    const current = await findItem(categorySlug, id);

    if (!current) {
      return Response.json({ error: "Item not found." }, { status: 404 });
    }

    const formData = await request.formData();
    const name = getRequiredString(formData, "name");
    const image = await replaceManagementImage({
      category: categorySlug,
      file: getSingleImageFile(formData, "image"),
      previousKey: current.imageKey,
    });
    const [item] = await getDb()
      .update(managementItems)
      .set({
        name,
        description: getRequiredString(formData, "description"),
        price: getRequiredString(formData, "price"),
        tag: getOptionalString(formData, "tag") ?? null,
        imageKey: image?.key ?? current.imageKey,
        imageUrl: image?.url ?? current.imageUrl,
        imageAlt: getOptionalString(formData, "imageAlt") ?? name,
        sortOrder: getOptionalInteger(formData, "sortOrder") ?? current.sortOrder,
        isActive: getOptionalBoolean(formData, "isActive") ?? current.isActive,
        updatedAt: new Date(),
      })
      .where(and(eq(managementItems.categorySlug, categorySlug), eq(managementItems.id, id)))
      .returning();

    await notifyPublicMenuContentUpdated(categorySlug);
    await trySyncChatbotMenuKnowledgeForCategory(categorySlug);

    return Response.json({ item: toManagementItemResponse(item) });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to update item.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ category: string; id: string }> },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  try {
    const { categorySlug, id } = await getParams(context);
    const current = await findItem(categorySlug, id);

    if (!current) {
      return Response.json({ error: "Item not found." }, { status: 404 });
    }

    await deleteR2Object(current.imageKey);
    await getDb()
      .delete(managementItems)
      .where(and(eq(managementItems.categorySlug, categorySlug), eq(managementItems.id, id)));

    await notifyPublicMenuContentUpdated(categorySlug);
    await trySyncChatbotMenuKnowledgeForCategory(categorySlug);

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to delete item.",
      },
      { status: 400 },
    );
  }
}
