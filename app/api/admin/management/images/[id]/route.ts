import { GetObjectCommand } from "@aws-sdk/client-s3";
import { eq } from "drizzle-orm";
import { requireAdminApiSession } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { managementItems } from "@/lib/db/schema";
import { getServerEnv } from "@/lib/env";
import { getR2Client } from "@/lib/r2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await requireAdminApiSession()))
    return new Response(null, { status: 401 });
  const { id } = await context.params;
  if (!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id))
    return new Response(null, { status: 400 });
  try {
    const [item] = await getDb().select({ key: managementItems.imageKey })
      .from(managementItems).where(eq(managementItems.id, id)).limit(1);
    if (!item?.key) return new Response(null, { status: 404 });
    const object = await getR2Client().send(new GetObjectCommand({
      Bucket: getServerEnv().R2_BUCKET_NAME,
      Key: item.key,
    }));
    if (!object.Body) return new Response(null, { status: 404 });
    const body = await object.Body.transformToByteArray();
    const type = object.ContentType?.split(";")[0];
    if (!type || !["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(type))
      return new Response(null, { status: 415 });
    return new Response(new Uint8Array(body).buffer, { headers: {
      "Content-Type": type,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return new Response(null, { status: 503 });
  }
}
