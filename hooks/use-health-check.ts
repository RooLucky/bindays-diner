"use client";

import { useEffect, useState } from "react";

type HealthState =
  | { status: "idle" | "loading" }
  | { status: "success"; ok: true }
  | { status: "error"; ok: false; message: string };

export function useHealthCheck(path: "/api/health/db" | "/api/health/storage") {
  const [state, setState] = useState<HealthState>({ status: "idle" });

  useEffect(() => {
    const controller = new AbortController();

    async function checkHealth() {
      setState({ status: "loading" });

      try {
        const response = await fetch(path, {
          signal: controller.signal,
        });
        const data = await response.json();

        if (!response.ok || data.ok !== true) {
          throw new Error(data.error?.message ?? "Health check failed.");
        }

        setState({ status: "success", ok: true });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          ok: false,
          message: error instanceof Error ? error.message : "Health check failed.",
        });
      }
    }

    void checkHealth();

    return () => {
      controller.abort();
    };
  }, [path]);

  return state;
}
