import { GetObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { reservations } from "@/lib/db/schema";
import { getR2Client } from "@/lib/r2";
import { getServerEnv } from "@/lib/env";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdminApiSession()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  if (!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id))
    return Response.json({ error: "Invalid order." }, { status: 400 });
  try {
    const [order] = await getDb()
      .select({ key: reservations.receiptKey })
      .from(reservations)
      .where(eq(reservations.id, id))
      .limit(1);
    if (!order?.key)
      return Response.json(
        { error: "No receipt has been uploaded." },
        { status: 404 },
      );
    const object = await getR2Client().send(
      new GetObjectCommand({
        Bucket: getServerEnv().R2_BUCKET_NAME,
        Key: order.key,
      }),
    );
    const type = object.ContentType?.split(";")[0];
    if (
      !object.Body ||
      !type ||
      !["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
        type,
      )
    ) {
      if (object.Body) await object.Body.transformToByteArray();
      return Response.json(
        { error: "This receipt format cannot be displayed." },
        { status: 415 },
      );
    }
    return new Response(
      new Uint8Array(await object.Body.transformToByteArray()).buffer,
      {
        headers: {
          "Content-Type": type,
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch {
    return Response.json(
      { error: "Unable to load the receipt. Please try again." },
      { status: 503 },
    );
  }
}
