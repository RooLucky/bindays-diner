import { submitReservationReceipt } from "@/lib/reservations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const formData = await request.formData();
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
          error instanceof Error
            ? error.message
            : "Unable to submit the payment receipt.",
      },
      { status: 400 },
    );
  }
}
