import {
  PublicRequestError,
  readLimitedBody,
} from "@/lib/public-request-error";
import { requirePublicFormLimit } from "@/lib/public-form-limit";
import { ZodError } from "zod";

import { createReservation } from "@/lib/reservations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limitError = await requirePublicFormLimit(request);
  if (limitError) return limitError;
  try {
    const reservation = await createReservation(
      await (await readLimitedBody(request)).json(),
      new URL(request.url).origin,
    );

    return Response.json({ reservation }, { status: 201 });
  } catch (error) {
    if (error instanceof PublicRequestError)
      return Response.json({ error: error.message }, { status: 400 });
    if (error instanceof ZodError) {
      return Response.json(
        { error: "Please complete all required delivery details correctly." },
        { status: 400 },
      );
    }

    return Response.json(
      {
        error:
          error instanceof Error &&
          error.message === "Reservation email is not configured."
            ? "Email delivery is not configured. Please contact the diner."
            : "Unable to send your delivery request. Please try again.",
      },
      { status: 500 },
    );
  }
}
