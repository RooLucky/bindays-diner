"use client";
import { useEffect, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogViewport,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { AdminDialogPopup } from "@/components/admin/AdminDialog";

export function OrderReceiptViewer({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<{ url: string; type: string } | null>(null);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(100);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    let url: string | undefined;
    setFile(null);
    setError("");
    setZoom(100);
    void (async () => {
      try {
        const response = await fetch(
          `/api/admin/orders/${encodeURIComponent(orderId)}/receipt`,
          {
            cache: "no-store",
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(20000),
            ]),
          },
        );
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error ?? "Unable to load receipt.");
        }
        const blob = await response.blob();
        if (controller.signal.aborted) return;
        url = URL.createObjectURL(blob);
        setFile({ url, type: blob.type });
      } catch (error) {
        if (!controller.signal.aborted)
          setError(
            error instanceof Error ? error.message : "Unable to load receipt.",
          );
      }
    })();
    return () => {
      controller.abort();
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, orderId, retry]);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        View receipt
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogPortal>
          <DialogBackdrop />
          <DialogViewport>
            <AdminDialogPopup className="flex h-[90dvh] w-[95vw] max-w-5xl flex-col overflow-hidden">
              <DialogTitle className="text-xl font-semibold">
                Payment receipt
              </DialogTitle>
              <DialogDescription className="break-all text-sm text-muted-foreground">
                Order {orderId}. Inspect the receipt before confirming payment.
              </DialogDescription>
              <div className="my-3 flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Zoom out"
                  disabled={!file || zoom <= 25}
                  onClick={() => setZoom((value) => Math.max(25, value - 25))}
                >
                  <ZoomOut />
                </Button>
                <span
                  aria-live="polite"
                  className="min-w-12 text-center text-sm"
                >
                  {zoom}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Zoom in"
                  disabled={!file || zoom >= 300}
                  onClick={() => setZoom((value) => Math.min(300, value + 25))}
                >
                  <ZoomIn />
                </Button>
                <Button
                  variant="outline"
                  disabled={!file}
                  onClick={() => setZoom(100)}
                >
                  <RotateCcw className="size-4" />
                  Reset
                </Button>
                {file?.type === "application/pdf" && (
                  <a
                    className="text-sm underline"
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open PDF in new tab
                  </a>
                )}
              </div>
              <div className="min-h-0 flex-1 overflow-auto rounded-lg border bg-muted/30 p-2">
                {error ? (
                  <div role="alert" className="p-4 text-sm">
                    {error}
                    <Button
                      className="ml-3"
                      variant="outline"
                      onClick={() => setRetry((value) => value + 1)}
                    >
                      Retry
                    </Button>
                  </div>
                ) : !file ? (
                  <p role="status" className="p-4 text-sm">
                    Loading receipt…
                  </p>
                ) : file.type === "application/pdf" ? (
                  <iframe
                    key={zoom}
                    title="Payment receipt PDF"
                    src={`${file.url}#zoom=${zoom}`}
                    className="h-full min-h-80 w-full border-0"
                  />
                ) : (
                  <img
                    src={file.url}
                    alt="Uploaded payment receipt"
                    style={{ width: `${zoom}%`, maxWidth: "none" }}
                    className="block h-auto"
                    onError={() =>
                      setError(
                        "The receipt image could not be displayed. Try loading it again.",
                      )
                    }
                  />
                )}
              </div>
              <div className="mt-3 flex justify-end">
                <DialogClose render={<Button variant="outline" />}>
                  Close receipt
                </DialogClose>
              </div>
            </AdminDialogPopup>
          </DialogViewport>
        </DialogPortal>
      </Dialog>
    </>
  );
}
