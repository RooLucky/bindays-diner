"use client";

import { useEffect, useRef, useState } from "react";

export function LoyaltyQrCode({
  data,
  memberCode,
}: {
  data: string;
  memberCode: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [download, setDownload] = useState<{
    data: string;
    url: string;
  } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    let objectUrl: string | undefined;
    setDownload(null);
    setError("");

    async function renderQr() {
      if (!containerRef.current) {
        return;
      }

      const styles = getComputedStyle(document.documentElement);
      const primary = styles.getPropertyValue("--primary").trim();
      const background = styles.getPropertyValue("--background").trim();
      const secondary = styles.getPropertyValue("--secondary").trim();
      const QRCodeStyling = (await import("qr-code-styling")).default;

      if (!mounted || !containerRef.current) {
        return;
      }

      containerRef.current.innerHTML = "";

      const qrCode = new QRCodeStyling({
        width: 660,
        height: 660,
        type: "canvas",
        data,
        margin: 24,
        dotsOptions: {
          color: primary,
          type: "rounded",
        },
        cornersSquareOptions: {
          color: secondary,
          type: "extra-rounded",
        },
        cornersDotOptions: {
          color: primary,
          type: "dot",
        },
        backgroundOptions: {
          color: background,
        },
      });

      qrCode.append(containerRef.current);
      const blob = await qrCode.getRawData("jpeg");
      if (!mounted) return;
      if (!(blob instanceof Blob) || blob.type !== "image/jpeg" || !blob.size) {
        throw new Error("Unable to create the JPG image.");
      }
      objectUrl = URL.createObjectURL(blob);
      setDownload({ data, url: objectUrl });
    }

    void renderQr().catch(() => {
      if (mounted)
        setError(
          "Unable to prepare the QR download. Refresh the page and try again.",
        );
    });

    return () => {
      mounted = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [data]);

  return (
    <div className="grid gap-4">
      <div
        ref={containerRef}
        className="mx-auto grid min-h-[246px] w-fit place-items-center rounded-sm border border-border bg-background p-3 [&>canvas]:h-[220px] [&>canvas]:w-[220px]"
      />
      {download?.data === data ? (
        <a
          href={download.url}
          download={`bindays-${memberCode}.jpg`}
          className="text-center text-sm font-semibold uppercase tracking-[0.08em] text-primary underline underline-offset-4"
        >
          Save QR Code (JPG)
        </a>
      ) : (
        <p
          role={error ? "alert" : "status"}
          className="text-center text-sm text-muted-foreground"
        >
          {error || "Preparing QR download…"}
        </p>
      )}
    </div>
  );
}
