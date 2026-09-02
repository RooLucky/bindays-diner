"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

type BarcodeDetectorResult = {
  rawValue: string;
};

type BarcodeDetectorInstance = {
  detect(video: HTMLVideoElement): Promise<BarcodeDetectorResult[]>;
};

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorInstance;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

function getMemberCode(value: string) {
  const trimmed = value.trim();

  if (/^BD-[A-Z0-9]+$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }

  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/^\/admin\/loyalty\/scan\/([^/]+)\/?$/i);

    return match?.[1] ? decodeURIComponent(match[1]).toUpperCase() : null;
  } catch {
    return null;
  }
}

export function AdminLoyaltyScanner() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const isDetectingRef = useRef(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [message, setMessage] = useState("");
  const [manualValue, setManualValue] = useState("");
  const [isScannerSupported, setIsScannerSupported] = useState<boolean | null>(null);

  function stopCamera() {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  }

  function continueToMember(memberCode: string) {
    stopCamera();
    router.push(`/admin/loyalty/scan/${encodeURIComponent(memberCode)}`);
  }

  useEffect(() => {
    setIsScannerSupported(typeof window.BarcodeDetector === "function");

    return () => stopCamera();
  }, []);

  async function detectQrCode(detector: BarcodeDetectorInstance) {
    if (isDetectingRef.current || !videoRef.current) {
      return;
    }

    isDetectingRef.current = true;

    try {
      const [result] = await detector.detect(videoRef.current);
      const memberCode = result ? getMemberCode(result.rawValue) : null;

      if (memberCode) {
        continueToMember(memberCode);
      } else if (result) {
        setMessage("This QR code is not a Binday's Diner loyalty card.");
      }
    } catch {
      setMessage("The camera could not read that QR code. Hold the card steady and try again.");
    } finally {
      isDetectingRef.current = false;
    }
  }

  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage("Camera access is not available in this browser.");
      return;
    }

    if (!window.BarcodeDetector) {
      setMessage(
        "QR scanning is not supported in this browser. Enter the member code or QR link below instead.",
      );
      return;
    }

    setIsStarting(true);
    setMessage("");
    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

      if (!videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setIsCameraActive(true);
      intervalRef.current = window.setInterval(() => {
        void detectQrCode(detector);
      }, 350);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Please allow camera access and try again.";
      setMessage(`Unable to start the camera. ${detail}`);
      stopCamera();
    } finally {
      setIsStarting(false);
    }
  }

  function submitManualValue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const memberCode = getMemberCode(manualValue);

    if (!memberCode) {
      setMessage("Enter a loyalty member code such as BD-123ABC or paste the loyalty QR link.");
      return;
    }

    continueToMember(memberCode);
  }

  return (
    <section className="rounded-sm border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="font-serif text-2xl italic text-brand-script">Staff tool</p>
          <h2 className="mt-2 font-serif text-[clamp(2rem,5vw,3rem)] leading-tight text-foreground">
            Scan Loyalty QR
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Scan a customer&apos;s loyalty card to open their stamp screen automatically.
          </p>
        </div>
        <Button
          type="button"
          variant={isCameraActive ? "outline" : "default"}
          className="rounded-sm"
          disabled={isStarting}
          onClick={() => (isCameraActive ? stopCamera() : void startCamera())}
        >
          {isCameraActive ? <RefreshCw className="size-4" /> : <Camera className="size-4" />}
          {isCameraActive ? "Stop camera" : "Open camera"}
        </Button>
      </div>

      <div className="mt-5 overflow-hidden rounded-sm border border-border bg-muted/30">
        <div className="relative aspect-video bg-foreground/95">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            muted
            playsInline
          />
          {!isCameraActive ? (
            <div className="absolute inset-0 grid place-items-center p-6 text-center text-background">
              <div>
                <ScanLine className="mx-auto size-10 opacity-80" />
                <p className="mt-3 text-sm font-semibold">Point the camera at a customer&apos;s QR card.</p>
                <p className="mt-1 text-xs text-background/70">
                  {isScannerSupported === false
                    ? "Use the manual entry below when QR scanning is unavailable."
                    : "Use the rear camera for the best scan result."}
                </p>
              </div>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="h-40 w-40 rounded-sm border-2 border-background/90 shadow-[0_0_0_999px_rgba(0,0,0,0.18)]" />
            </div>
          )}
        </div>
      </div>

      {message ? (
        <p className="mt-4 rounded-sm border border-primary/25 bg-primary/5 px-3 py-2 text-sm leading-6 text-foreground">
          {message}
        </p>
      ) : null}

      <form className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]" onSubmit={submitManualValue}>
        <label className="grid gap-1.5 text-sm font-medium text-foreground">
          Member code or QR link
          <input
            value={manualValue}
            onChange={(event) => setManualValue(event.target.value)}
            className="h-11 rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
            placeholder="BD-XXXXXXXXXXXX"
          />
        </label>
        <Button type="submit" className="mt-auto h-11 rounded-sm">
          Open loyalty card
        </Button>
      </form>
    </section>
  );
}
