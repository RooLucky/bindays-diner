"use client";

import { useEffect, useRef, useState } from "react";
import {
  submitPublicForm,
  submitVerifiedForm,
} from "@/lib/public-form-request";

type CaptchaApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => number;
  reset: (id: number) => void;
};
declare global {
  interface Window {
    grecaptcha?: CaptchaApi;
    bindaysRecaptchaLoaded?: () => void;
  }
}
let loading: Promise<CaptchaApi> | undefined;
function loadCaptcha() {
  if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
  if (!loading)
    loading = new Promise<CaptchaApi>((resolve, reject) => {
      window.bindaysRecaptchaLoaded = () => resolve(window.grecaptcha!);
      const script = document.createElement("script");
      script.src =
        "https://www.google.com/recaptcha/api.js?onload=bindaysRecaptchaLoaded&render=explicit";
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        loading = undefined;
        script.remove();
        reject(new Error("Unable to load verification."));
      };
      document.head.appendChild(script);
    });
  return loading;
}

export function Recaptcha({
  onToken,
  resetKey,
  size = "compact",
  className = "my-3 grid gap-2",
}: {
  onToken: (token: string) => void;
  resetKey: number;
  size?: "compact" | "normal";
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  useEffect(() => {
    if (!siteKey || !container.current) return;
    let cancelled = false;
    let id: number | undefined;
    const element = document.createElement("div");
    container.current.appendChild(element);
    setError("");
    setVerified(false);
    loadCaptcha()
      .then((api) => {
        if (cancelled) return;
        id = api.render(element, {
          sitekey: siteKey,
          size:
            size === "normal" && (container.current?.clientWidth ?? 0) < 304
              ? "compact"
              : size,
          callback: (token: string) => {
            if (cancelled) return;
            setVerified(Boolean(token));
            callback.current(token);
          },
          "expired-callback": () => {
            if (cancelled) return;
            setVerified(false);
            callback.current("");
          },
          "error-callback": () => {
            if (cancelled) return;
            setVerified(false);
            callback.current("");
            setError(
              "Verification unavailable. Check your connection and reload this page.",
            );
          },
        });
      })
      .catch(() => {
        if (!cancelled)
          setError(
            "Unable to load reCAPTCHA. Check your connection and reload this page.",
          );
      });
    return () => {
      cancelled = true;
      callback.current("");
      if (id !== undefined) window.grecaptcha?.reset(id);
      element.remove();
    };
  }, [siteKey, resetKey, size]);
  return (
    <div className={verified ? "hidden" : className}>
      <div ref={container} />
      {!siteKey || error ? (
        <p role="alert" className="text-sm text-destructive">
          {error ||
            "Verification is not configured. Please contact the restaurant."}
        </p>
      ) : null}
    </div>
  );
}

const sessionEvent = "bindays-antibot-session";
let sessionRevision = 0;
let verification: Promise<boolean> | undefined;

function publishSession(verified: boolean) {
  sessionRevision += 1;
  window.dispatchEvent(new CustomEvent(sessionEvent, { detail: verified }));
}

async function checkSession() {
  if (verification) await verification;
  const revision = sessionRevision;
  const response = await submitPublicForm("/api/recaptcha/session", {
    cache: "no-store",
  });
  const data = await response.json();
  const verified = response.ok && data.verified === true;
  if (revision === sessionRevision) publishSession(verified);
  return verified;
}

export function useRecaptcha(options?: {
  size?: "compact" | "normal";
  className?: string;
}) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const submitting = useRef(false);

  useEffect(() => {
    const update = (event: Event) => {
      const valid = (event as CustomEvent<boolean>).detail;
      setVerified(valid);
      if (valid) setError("");
    };
    const refresh = () => {
      void checkSession();
    };
    window.addEventListener(sessionEvent, update);
    window.addEventListener("focus", refresh);
    refresh();
    return () => {
      window.removeEventListener(sessionEvent, update);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  async function acceptToken(token: string) {
    if (!token) return;
    setChecking(true);
    setError("");
    if (!verification) {
      verification = (async () => {
        const response = await submitVerifiedForm(
          "/api/recaptcha/session",
          { method: "POST" },
          token,
        );
        const data = await response.json();
        const valid = response.ok && data.verified === true;
        publishSession(valid);
        if (!valid)
          setError(data.error ?? "Verification failed. Please try again.");
        return valid;
      })().finally(() => {
        verification = undefined;
      });
    }
    const valid = await verification;
    setChecking(false);
    if (!valid) setResetKey((value) => value + 1);
  }

  async function protectedFetch(input: string, init: RequestInit) {
    if (submitting.current)
      return Response.json(
        { ok: false, error: "Please wait for your current request." },
        { status: 409 },
      );
    submitting.current = true;
    try {
      if (verification) await verification;
      if (!verified && !(await checkSession())) {
        return Response.json(
          {
            ok: false,
            error: "Complete the reCAPTCHA verification before submitting.",
          },
          { status: 403 },
        );
      }
      const response = await submitPublicForm(input, init);
      const data = await response.clone().json();
      if (data.captchaRequired) {
        publishSession(false);
        setResetKey((value) => value + 1);
      }
      return response;
    } finally {
      submitting.current = false;
    }
  }
  return {
    protectedFetch,
    isVerified: verified === true,
    captcha:
      verified === true ? null : verified === null ? (
        <p role="status" className="my-2 text-xs text-muted-foreground">
          Checking verification…
        </p>
      ) : (
        <div>
          <Recaptcha
            onToken={acceptToken}
            resetKey={resetKey}
            size={options?.size}
            className={options?.className}
          />
          {checking ? (
            <p role="status" className="my-2 text-xs text-muted-foreground">
              Verifying…
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="my-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>
      ),
  };
}
