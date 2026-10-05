import {
  PublicRequestError,
  readLimitedBody,
} from "@/lib/public-request-error";
import { consumePublicFormLimit } from "@/lib/chatbot/rate-limit";
import { requirePublicFormLimit } from "@/lib/public-form-limit";
import { z } from "zod";

import { createAdminSession, verifyAdminCredentials } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(256),
});

export async function POST(request: Request) {
  const limitError = await requirePublicFormLimit(request);
  if (limitError) return limitError;
  try {
    const input = loginSchema.parse(
      await (await readLimitedBody(request)).json(),
    );
    const limit = await consumePublicFormLimit(
      "login-account",
      input.email.trim().toLowerCase(),
      5,
    );
    if (!limit.allowed)
      return Response.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    const account = await verifyAdminCredentials(input.email, input.password);

    if (!account) {
      return Response.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }

    await createAdminSession(account.id);

    return Response.json({
      user: {
        id: account.id,
        email: account.email,
        fullName: account.fullName,
        role: account.role,
      },
    });
  } catch (error) {
    return Response.json(
      {
        error: "Unable to log in.",
      },
      { status: 400 },
    );
  }
}
