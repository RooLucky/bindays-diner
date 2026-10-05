import { requireAdminApiSession } from "@/lib/admin-auth";
import { readAdminOrders } from "@/lib/admin-orders";
import { createOrdersWorkbook } from "@/lib/orders-workbook";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!(await requireAdminApiSession()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { orders } = await readAdminOrders(
      new URL(request.url).searchParams,
      true,
    );
    const bytes = await createOrdersWorkbook(orders);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition":
          'attachment; filename="bindays-diner-orders.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error &&
          error.message.startsWith("Narrow your filters")
            ? error.message
            : "Unable to export orders.",
      },
      { status: 400 },
    );
  }
}
