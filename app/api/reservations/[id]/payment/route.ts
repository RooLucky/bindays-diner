import {
  PublicRequestError,
  readLimitedBody,
} from "@/lib/public-request-error";
import { requirePublicFormLimit } from "@/lib/public-form-limit";
import { submitReservationReceipt } from "@/lib/reservations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const limitError = await requirePublicFormLimit(request);
  if (limitError) return limitError;
  try {
    const { id } = await context.params;
    const formData = await (
      await readLimitedBody(request, 12 * 1024 * 1024)
    ).formData();
    const token = formData.get("token");
    const receipt = formData.get("receipt");

    if (typeof token !== "string" || !(receipt instanceof File)) {
      return Response.json(
        { error: "Choose a payment receipt before submitting." },
        { status: 400 },
      );
    }

    const reservation = await submitReservationReceipt({ id, token, receipt });
    return Response.json({ reservation });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof PublicRequestError
            ? error.message
            : "Unable to submit the payment receipt.",
      },
      { status: 400 },
    );
  }
}
