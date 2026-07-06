import { z } from "zod";

import {
  createAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
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
        error: error instanceof Error ? error.message : "Unable to log in.",
      },
      { status: 400 },
    );
  }
}
