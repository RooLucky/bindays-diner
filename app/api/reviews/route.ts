import { ZodError } from "zod";

import {
  createCustomerReview,
  getPublicReviewsPayload,
} from "@/lib/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getPublicReviewsPayload();

  return Response.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  try {
    const review = await createCustomerReview(await request.formData());

    return Response.json({ review }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: "Please complete the review form correctly.",
          issues: error.issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to submit your review.",
      },
      { status: 400 },
    );
  }
}
