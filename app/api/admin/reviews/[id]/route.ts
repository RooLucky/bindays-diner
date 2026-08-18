import { revalidatePath } from "next/cache";

import { requireAdminApiSession } from "@/lib/admin-auth";
import type { CustomerReviewStatus } from "@/lib/review-contracts";
import {
  deleteCustomerReview,
  updateCustomerReviewStatus,
} from "@/lib/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function unauthorized() {
  return Response.json({ error: "Unauthorized." }, { status: 401 });
}

async function getId(context: { params: Promise<{ id: string }> }) {
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
    const body = (await request.json()) as { status?: unknown };
    const review = await updateCustomerReviewStatus({
      id: await getId(context),
      status: body.status as CustomerReviewStatus,
    });

    revalidatePath("/home");

    return Response.json({ review });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to update review.",
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
    await deleteCustomerReview(await getId(context));
    revalidatePath("/home");

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to delete review.",
      },
      { status: 400 },
    );
  }
}
