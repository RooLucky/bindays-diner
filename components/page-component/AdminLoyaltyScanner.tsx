"use client";

import { Input } from "@/components/ui/input";

import { AdminPanel } from "@/components/admin/AdminPanel";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, ScanLine } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { withCameraTimeout } from "@/lib/camera-startup";

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
  const frameTimeoutRef = useRef<number | null>(null);
  const cameraAttemptRef = useRef(0);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [message, setMessage] = useState("");
  const [manualValue, setManualValue] = useState("");
  function stopCamera() {
    cameraAttemptRef.current += 1;
    setIsStarting(false);
    if (frameTimeoutRef.current !== null) {
      window.clearTimeout(frameTimeoutRef.current);
      frameTimeoutRef.current = null;
    }
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  }

  function continueToMember(memberCode: string) {
    stopCamera();
    router.push(`/admin/loyalty/scan/${encodeURIComponent(memberCode)}`);
  }

  useEffect(() => {
    return () => stopCamera();
  }, []);

  async function startCamera() {
    if (!window.isSecureContext) {
      setMessage(
        "Camera access requires HTTPS. Open the secure website, or use localhost on this device for development.",
      );
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setMessage(
        "Camera access is unavailable. Open this page in a browser with camera support, or enter the member code below.",
      );
      return;
    }
    stopCamera();
    const attempt = cameraAttemptRef.current;
    setIsStarting(true);
    setMessage("");
    try {
      const stream = await withCameraTimeout(
        navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: { ideal: "environment" } },
        }),
        20000,
        "The camera did not respond. Allow access in the browser's camera prompt or site settings, then click Open camera again.",
        (lateStream) => lateStream.getTracks().forEach((track) => track.stop()),
      );
      if (attempt !== cameraAttemptRef.current || !videoRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      video.muted = true;
      video.defaultMuted = true;
      video.playsInline = true;
      video.srcObject = stream;
      await withCameraTimeout(
        video.play(),
        12000,
        "The camera connected but the preview did not start. Close other apps using the camera, then try again.",
      );
      if (attempt !== cameraAttemptRef.current) return;
      const { default: jsQR } = await withCameraTimeout(
        import("jsqr"),
        12000,
        "The scanner could not load. Refresh this page and try again.",
      );
      if (attempt !== cameraAttemptRef.current) return;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Unable to prepare the QR scanner.");
      frameTimeoutRef.current = window.setTimeout(() => {
        if (attempt !== cameraAttemptRef.current) return;
        setMessage(
          "The camera is not sending video. Check the camera's privacy shutter and device settings, or try another camera.",
        );
        stopCamera();
      }, 12000);
      let receivedFrame = false;
      stream.getVideoTracks().forEach((track) => {
        track.addEventListener(
          "ended",
          () => {
            if (attempt !== cameraAttemptRef.current) return;
            setMessage(
              "The camera disconnected. Reconnect it and click Open camera.",
            );
            stopCamera();
          },
          { once: true },
        );
      });
      intervalRef.current = window.setInterval(() => {
        if (
          attempt !== cameraAttemptRef.current ||
          video.readyState < 2 ||
          !video.videoWidth ||
          !video.videoHeight
        )
          return;
        const scale = Math.min(1, 960 / video.videoWidth);
        canvas.width = Math.round(video.videoWidth * scale);
        canvas.height = Math.round(video.videoHeight * scale);
        try {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          if (!receivedFrame) {
            receivedFrame = true;
            if (frameTimeoutRef.current !== null)
              window.clearTimeout(frameTimeoutRef.current);
            frameTimeoutRef.current = null;
            setIsCameraActive(true);
            setIsStarting(false);
          }
          const frame = context.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(frame.data, frame.width, frame.height);
          if (!result) return;
          const memberCode = getMemberCode(result.data);
          if (memberCode) continueToMember(memberCode);
          else setMessage("This QR code is not a Binday's Diner loyalty card.");
        } catch {
          setMessage(
            "Unable to read the camera image. Stop and reopen the camera to try again.",
          );
          stopCamera();
        }
      }, 350);
    } catch (error) {
      if (attempt !== cameraAttemptRef.current) return;
      const name = error instanceof Error ? error.name : "";
      const messages: Record<string, string> = {
        NotAllowedError:
          "Camera permission was blocked. Allow camera access in your browser's site settings, then try again.",
        NotFoundError:
          "No camera was found. Connect a camera or enter the member code below.",
        NotReadableError:
          "The camera is busy or unavailable. Close other apps using it, then try again.",
        OverconstrainedError:
          "This camera cannot use the requested settings. Try another camera or enter the member code below.",
        SecurityError:
          "Camera access is disabled by the browser or device settings.",
      };
      setMessage(
        (name === "CameraTimeoutError" && error instanceof Error
          ? error.message
          : messages[name]) ??
          "Unable to start the camera. Check camera access and try again, or enter the member code below.",
      );
      stopCamera();
    }
  }

  function submitManualValue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const memberCode = getMemberCode(manualValue);

    if (!memberCode) {
      setMessage(
        "Enter a loyalty member code such as BD-123ABC or paste the loyalty QR link.",
      );
      return;
    }

    continueToMember(memberCode);
  }

  return (
    <AdminPanel className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Scan Loyalty QR
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Scan a customer&apos;s loyalty card to open their stamp screen
            automatically.
          </p>
        </div>
        <Button
          type="button"
          variant={isCameraActive ? "outline" : "default"}
          className="rounded-lg"
          onClick={() =>
            isCameraActive || isStarting ? stopCamera() : void startCamera()
          }
        >
          {isCameraActive ? (
            <RefreshCw className="size-4" />
          ) : (
            <Camera className="size-4" />
          )}
          {isStarting
            ? "Cancel camera"
            : isCameraActive
              ? "Stop camera"
              : "Open camera"}
        </Button>
      </div>

      <div className="mt-5 max-w-xl overflow-hidden rounded-lg border border-border bg-muted/30">
        <div className="relative aspect-video bg-foreground/95">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            autoPlay
            muted
            playsInline
            controls={false}
            disablePictureInPicture
          />
          {!isCameraActive ? (
            <div className="absolute inset-0 grid place-items-center p-6 text-center text-background">
              <div>
                <ScanLine className="mx-auto size-10 opacity-80" />
                <p className="mt-3 text-sm font-semibold">
                  {isStarting
                    ? "Opening camera… Allow access when prompted."
                    : "Point the camera at a customer’s QR card."}
                </p>
                <p className="mt-1 text-xs text-background/70">
                  Use the rear camera for the best scan result.
                </p>
              </div>
            </div>
          ) : (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <span className="h-40 w-40 rounded-lg border-2 border-background/90 shadow-[0_0_0_999px_rgba(0,0,0,0.18)]" />
            </div>
          )}
        </div>
      </div>

      {message ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2 text-sm leading-6 text-foreground"
        >
          {message}
        </p>
      ) : null}

      <form
        className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]"
        onSubmit={submitManualValue}
      >
        <label className="grid gap-1.5 text-sm font-medium text-foreground">
          Member code or QR link
          <Input
            value={manualValue}
            onChange={(event) => setManualValue(event.target.value)}
            className="h-11 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/30"
            placeholder="BD-XXXXXXXXXXXX"
          />
        </label>
        <Button type="submit" className="mt-auto h-11 rounded-lg">
          Open loyalty card
        </Button>
      </form>
    </AdminPanel>
  );
}
