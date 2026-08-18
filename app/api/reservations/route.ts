import { ZodError } from "zod";

import { createReservation } from "@/lib/reservations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const reservation = await createReservation(
      await request.json(),
      new URL(request.url).origin,
    );

    return Response.json({ reservation }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Please complete all required delivery details correctly." },
        { status: 400 },
      );
    }

    return Response.json(
      {
        error:
          error instanceof Error && error.message === "Reservation email is not configured."
            ? "Email delivery is not configured. Please contact the diner."
            : "Unable to send your delivery request. Please try again.",
      },
      { status: 500 },
    );
  }
}
