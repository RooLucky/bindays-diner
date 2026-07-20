import { eq } from "drizzle-orm";

import { requireAdminApiSession } from "@/lib/admin-auth";
import { trySyncChatbotMenuKnowledgeForCategory } from "@/lib/chatbot/menu-knowledge";
import { getDb } from "@/lib/db";
import { managementCategories } from "@/lib/db/schema";
import {
  getManagementPayload,
  getStaticManagementCategory,
  requireManagementCategorySlug,
  toManagementCategoryResponse,
} from "@/lib/management";
import { notifyPublicMenuContentUpdated } from "@/lib/realtime";
import {
  getRequiredString,
  getSingleImageFile,
  replaceManagementImage,
} from "@/lib/management-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getCategoryFromContext(context: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await context.params;
  return requireManagementCategorySlug(category);
}

function unauthorized() {
  return Response.json({ error: "Unauthorized." }, { status: 401 });
}

function parseBadge(formData: FormData) {
  const value = formData.get("badge");

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ category: string }> },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  try {
    const slug = await getCategoryFromContext(context);
    return Response.json(await getManagementPayload(slug));
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to fetch category.",
      },
      { status: 400 },
    );
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ category: string }> },
) {
  if (!(await requireAdminApiSession())) {
    return unauthorized();
  }

  try {
    const slug = await getCategoryFromContext(context);
    const formData = await request.formData();
    const db = getDb();
    const [current] = await db
      .select()
      .from(managementCategories)
      .where(eq(managementCategories.slug, slug))
      .limit(1);
    const fallback = getStaticManagementCategory(slug);
    const heroImage = await replaceManagementImage({
      category: slug,
      file: getSingleImageFile(formData, "heroImage"),
      previousKey: current?.heroImageKey,
    });

    const values = {
      slug,
      eyebrow: getRequiredString(formData, "eyebrow"),
      title: getRequiredString(formData, "title"),
      description: getRequiredString(formData, "description"),
      ctaLabel: getRequiredString(formData, "ctaLabel"),
      ctaHref: getRequiredString(formData, "ctaHref"),
      heroImageKey: heroImage?.key ?? current?.heroImageKey ?? fallback.heroImageKey,
      heroImageUrl: heroImage?.url ?? current?.heroImageUrl ?? fallback.heroImageUrl,
      heroAlt: getRequiredString(formData, "heroAlt"),
      badge: parseBadge(formData),
      updatedAt: new Date(),
    };

    const [category] = await db
      .insert(managementCategories)
      .values(values)
      .onConflictDoUpdate({
        target: managementCategories.slug,
        set: values,
      })
      .returning();

    await notifyPublicMenuContentUpdated(slug);
    await trySyncChatbotMenuKnowledgeForCategory(slug);

    return Response.json({ category: toManagementCategoryResponse(category) });
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
