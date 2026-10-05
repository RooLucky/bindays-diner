"use client";
import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { AdminDialogPopup } from "@/components/admin/AdminDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogViewport,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  type AdminOrder,
  orderStatuses,
  orderStatusLabels,
} from "@/lib/order-contracts";

const peso = (value: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(
    value,
  );
const placed = (date: string) =>
  new Date(date).toLocaleString("en-PH", { timeZone: "Asia/Manila" });

export function AdminOrdersClient() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      q: search,
      status,
      page: String(page),
    });
    (async () => {
      try {
        const response = await fetch(`/api/admin/orders?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.error ?? "Unable to load orders.");
        if (!controller.signal.aborted) {
          setOrders(data.orders);
          setTotal(data.total);
        }
      } catch (error) {
        if (!controller.signal.aborted)
          setError(
            error instanceof Error ? error.message : "Unable to load orders.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [search, status, page, refresh]);

  async function exportOrders() {
    setExporting(true);
    try {
      const response = await fetch(
        `/api/admin/orders/export?${new URLSearchParams({ q: search, status })}`,
        { cache: "no-store" },
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error ?? "Unable to export orders.");
      }
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a");
      link.href = url;
      link.download = "bindays-diner-orders.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Orders exported to Excel.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to export orders.",
      );
    } finally {
      setExporting(false);
    }
  }
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="Review customer delivery orders and export records to Excel."
      >
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => setRefresh((value) => value + 1)}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
        <Button
          disabled={exporting || loading || Boolean(error) || total === 0}
          onClick={exportOrders}
        >
          <Download className="size-4" />
          {exporting ? "Exporting…" : "Export to Excel"}
        </Button>
      </AdminPageHeader>
      <AdminPanel>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b p-4">
          <form
            className="flex w-full max-w-md gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(1);
              setSearch(query.trim());
            }}
          >
            <Input
              aria-label="Search orders"
              placeholder="Customer, email, phone, or order ID"
              value={query}
              maxLength={160}
              onChange={(event) => setQuery(event.target.value)}
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
          <select
            aria-label="Payment status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All payment statuses</option>
            {orderStatuses.map((value) => (
              <option key={value} value={value}>
                {orderStatusLabels[value]}
              </option>
            ))}
          </select>
        </div>
        {error ? (
          <div role="alert" className="p-6 text-sm text-destructive">
            {error}{" "}
            <Button
              variant="outline"
              onClick={() => setRefresh((value) => value + 1)}
            >
              Retry
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order / placed</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-8 text-center">
                    Loading orders…
                  </TableCell>
                </TableRow>
              ) : !orders.length ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    No orders match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <p className="font-medium">
                        {order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {placed(order.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{order.fullName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.phone}
                      </p>
                    </TableCell>
                    <TableCell>
                      {order.deliveryDate}
                      <p className="text-xs text-muted-foreground">
                        {order.deliveryTime}
                      </p>
                    </TableCell>
                    <TableCell className="font-medium">
                      {peso(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.status === "paid" ? "default" : "secondary"
                        }
                      >
                        {orderStatusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelected(order);
                          setDetailsOpen(true);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t p-4 text-sm text-muted-foreground">
          <span>{total} matching orders · Times shown in Asia/Manila</span>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || page <= 1}
              onClick={() => setPage((value) => value - 1)}
            >
              Previous
            </Button>
            <span>
              Page {page} of {Math.max(1, Math.ceil(total / 25))}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || page * 25 >= total}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </AdminPanel>
      <p className="text-sm text-muted-foreground">
        A submitted receipt still needs staff verification. Excel exports
        include every matching order, up to 10,000 orders.
      </p>
      <Dialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onOpenChangeComplete={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogPortal>
          <DialogBackdrop />
          <DialogViewport>
            <AdminDialogPopup className="max-h-[85dvh] max-w-2xl overflow-y-auto">
              <DialogTitle className="text-xl font-semibold">
                Order details
              </DialogTitle>
              <DialogDescription className="mt-1 break-all text-sm text-muted-foreground">
                {selected?.id}
              </DialogDescription>
              {selected && (
                <div className="mt-5 space-y-5 text-sm">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <h3 className="font-semibold">Customer</h3>
                      <p>{selected.fullName}</p>
                      <p className="break-all">{selected.email}</p>
                      <p>{selected.phone}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold">Delivery</h3>
                      <p>
                        {selected.deliveryDate} at {selected.deliveryTime}
                      </p>
                      <p className="whitespace-pre-wrap break-words">
                        {selected.deliveryAddress}
                      </p>
                      {selected.landmark && (
                        <p>Landmark: {selected.landmark}</p>
                      )}
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selected.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.price}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="flex flex-wrap justify-between gap-3">
                    <Badge variant="secondary">
                      {orderStatusLabels[selected.status]}
                    </Badge>
                    <div className="text-right">
                      <p>Food subtotal: {peso(selected.subtotal)}</p>
                      <p>Delivery fee: {peso(selected.deliveryFee)}</p>
                      <strong>Total: {peso(selected.total)}</strong>
                    </div>
                  </div>
                  {selected.notes && (
                    <div>
                      <h3 className="font-semibold">Notes</h3>
                      <p className="whitespace-pre-wrap break-words">
                        {selected.notes}
                      </p>
                    </div>
                  )}
                  <p className="text-muted-foreground">
                    Placed: {placed(selected.createdAt)} (Asia/Manila)
                  </p>
                </div>
              )}
              <div className="mt-6 flex justify-end">
                <DialogClose render={<Button variant="outline" />}>
                  Close
                </DialogClose>
              </div>
            </AdminDialogPopup>
          </DialogViewport>
        </DialogPortal>
      </Dialog>
    </div>
  );
}
