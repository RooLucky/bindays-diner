"use client";

import { useEffect } from "react";

import type { LoyaltyCardResponse } from "@/lib/loyalty-contracts";

export function useLoyaltyCardRefresh(
  memberCode: string | undefined,
  onRefresh: (card: LoyaltyCardResponse) => void,
) {
  useEffect(() => {
    if (!memberCode) return;

    const controller = new AbortController();
    let refreshing = false;
    async function refresh() {
      if (document.visibilityState !== "visible" || refreshing) return;
      refreshing = true;
      try {
        const response = await fetch(`/api/loyalty/${encodeURIComponent(memberCode!)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = await response.json() as { ok: boolean; card?: LoyaltyCardResponse };
        if (!controller.signal.aborted && data.ok && data.card) onRefresh(data.card);
      } catch {
        // Keep the last loaded card during a temporary connection failure.
      } finally {
        refreshing = false;
      }
    }

    const interval = window.setInterval(refresh, 15_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [memberCode, onRefresh]);
}
