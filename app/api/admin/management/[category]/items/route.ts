import { eq } from "drizzle-orm";

import { requireAdminApiSession } from "@/lib/admin-auth";
import { trySyncChatbotMenuKnowledgeForCategory } from "@/lib/chatbot/menu-knowledge";
import { getDb } from "@/lib/db";
import { managementCategories, managementItems } from "@/lib/db/schema";
import {
  getStaticManagementCategory,
  requireManagementCategorySlug,
  toManagementItemResponse,
} from "@/lib/management";
import { notifyPublicMenuContentUpdated } from "@/lib/realtime";
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

async function getCategoryFromContext(context: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await context.params;
  return requireManagementCategorySlug(category);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ category: string }> },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  try {
    const categorySlug = await getCategoryFromContext(context);
    const formData = await request.formData();
    const db = getDb();
    const fallback = getStaticManagementCategory(categorySlug);

    await db
      .insert(managementCategories)
      .values(fallback)
      .onConflictDoNothing({ target: managementCategories.slug });

    const [category] = await db
      .select()
      .from(managementCategories)
      .where(eq(managementCategories.slug, categorySlug))
      .limit(1);
    const name = getRequiredString(formData, "name");
    const image = await replaceManagementImage({
      category: categorySlug,
      file: getSingleImageFile(formData, "image"),
    });
    const imageUrl = image?.url ?? category?.heroImageUrl ?? fallback.heroImageUrl;

    const [item] = await db
      .insert(managementItems)
      .values({
        categorySlug,
        name,
        description: getRequiredString(formData, "description"),
        price: getRequiredString(formData, "price"),
        tag: getOptionalString(formData, "tag") ?? null,
        imageKey: image?.key ?? null,
        imageUrl,
        imageAlt: getOptionalString(formData, "imageAlt") ?? name,
        sortOrder: getOptionalInteger(formData, "sortOrder") ?? 0,
        isActive: getOptionalBoolean(formData, "isActive") ?? true,
      })
      .returning();

    await notifyPublicMenuContentUpdated(categorySlug);
    await trySyncChatbotMenuKnowledgeForCategory(categorySlug);

    return Response.json({ item: toManagementItemResponse(item) }, { status: 201 });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Unable to create item.",
      },
      { status: 400 },
    );
  }
}
