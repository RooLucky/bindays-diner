"use client";

import { useEffect, useRef } from "react";

export function LoyaltyQrCode({
  data,
  memberCode,
}: {
  data: string;
  memberCode: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<{ download: (options: { name: string; extension: "svg" }) => Promise<void> } | null>(
    null,
  );

  useEffect(() => {
    let mounted = true;

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
        width: 220,
        height: 220,
        type: "svg",
        data,
        margin: 8,
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
      qrRef.current = qrCode;
    }

    void renderQr();

    return () => {
      mounted = false;
    };
  }, [data]);

  return (
    <div className="grid gap-4">
      <div
        ref={containerRef}
        className="mx-auto grid min-h-[220px] w-[220px] place-items-center rounded-sm border border-border bg-background p-3"
      />
      <button
        type="button"
        className="text-sm font-semibold uppercase tracking-[0.08em] text-primary underline underline-offset-4"
        onClick={() => {
          void qrRef.current?.download({
            name: `bindays-${memberCode}`,
            extension: "svg",
          });
        }}
      >
        Save QR Code
      </button>
    </div>
  );
}
