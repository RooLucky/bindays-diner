import {
  PublicRequestError,
  readLimitedBody,
} from "@/lib/public-request-error";
import { requireRecaptcha } from "@/lib/recaptcha";
import { ZodError } from "zod";

import { createCustomerReview, getPublicReviewsPayload } from "@/lib/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const payload = await getPublicReviewsPayload();

  return Response.json(payload, {
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const captchaError = await requireRecaptcha(request);
  if (captchaError) return captchaError;
  try {
    const review = await createCustomerReview(
      await (await readLimitedBody(request, 12 * 1024 * 1024)).formData(),
    );

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
          error instanceof PublicRequestError
            ? error.message
            : "Unable to submit your review.",
      },
      { status: 400 },
    );
  }
}
