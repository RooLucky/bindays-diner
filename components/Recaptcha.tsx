"use client";

import { useEffect, useRef, useState } from "react";
import { submitVerifiedForm } from "@/lib/public-form-request";

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
}: {
  onToken: (token: string) => void;
  resetKey: number;
}) {
  const container = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  const [error, setError] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  useEffect(() => {
    if (!siteKey || !container.current) return;
    let cancelled = false;
    let id: number | undefined;
    const element = document.createElement("div");
    container.current.appendChild(element);
    setError("");
    loadCaptcha()
      .then((api) => {
        if (cancelled) return;
        id = api.render(element, {
          sitekey: siteKey,
          size: "compact",
          callback: (token: string) => callback.current(token),
          "expired-callback": () => callback.current(""),
          "error-callback": () => {
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
  }, [siteKey, resetKey]);
  return (
    <div className="my-3 grid gap-2">
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

export function useRecaptcha() {
  const [token, setToken] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const submitting = useRef(false);
  async function protectedFetch(input: string, init: RequestInit) {
    if (!token || submitting.current)
      return Response.json(
        {
          ok: false,
          error: "Complete the reCAPTCHA verification before submitting.",
        },
        { status: 403 },
      );
    submitting.current = true;
    try {
      return await submitVerifiedForm(input, init, token);
    } finally {
      submitting.current = false;
      setToken("");
      setResetKey((value) => value + 1);
    }
  }
  return {
    protectedFetch,
    captcha: <Recaptcha onToken={setToken} resetKey={resetKey} />,
  };
}
