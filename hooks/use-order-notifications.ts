"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import type { Realtime } from "ably";
import {
  ADMIN_ORDERS_CHANNEL,
  ORDER_UPDATED_EVENT,
  ORDER_REFRESH_EVENT,
} from "@/lib/order-realtime-contracts";

export function useOrderNotifications(userId: string) {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const refreshRef = useRef<() => void>(() => {});
  const [unread, setUnread] = useState(0);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const key = `bindays-orders-read:${userId}`;
    const controller = new AbortController();
    let client: Realtime | undefined;
    let busy = false,
      queued = false,
      ended = false,
      marker = "";
    try {
      marker = localStorage.getItem(key) ?? "";
    } catch {
      /* In-memory fallback. */
    }
    async function refresh() {
      if (ended || document.visibilityState !== "visible") return;
      if (busy) {
        queued = true;
        return;
      }
      busy = true;
      try {
        const response = await fetch(
          `/api/admin/orders/notifications?${new URLSearchParams(marker ? { since: marker } : {})}`,
          {
            cache: "no-store",
            signal: AbortSignal.any([
              controller.signal,
              AbortSignal.timeout(10000),
            ]),
          },
        );
        if (response.status === 401) {
          ended = true;
          client?.close();
          setUnread(0);
          setLive(false);
          return;
        }
        if (!response.ok) return;
        const data = await response.json();
        if (ended) return;
        if (pathRef.current === "/management/orders") {
          marker = data.cursor;
          try {
            localStorage.setItem(key, marker);
          } catch {
            /* Keep the marker in memory. */
          }
          setUnread(0);
        } else setUnread(data.unread);
      } catch {
        /* The next poll or reconnect retries without discarding the count. */
      } finally {
        busy = false;
        if (queued && !ended) {
          queued = false;
          void refresh();
        }
      }
    }
    function changed() {
      window.dispatchEvent(new Event(ORDER_REFRESH_EVENT));
      void refresh();
    }
    refreshRef.current = changed;
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) {
        marker = event.newValue ?? "";
        void refresh();
      }
    };
    async function connect() {
      try {
        const response = await fetch("/api/admin/orders/realtime", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok || ended) return;
        const firstToken = await response.json();
        const Ably = await import("ably");
        if (ended) return;
        let initial = true;
        client = new Ably.Realtime({
          authCallback: async (_params, callback) => {
            if (initial) {
              initial = false;
              callback(null, firstToken);
              return;
            }
            try {
              const response = await fetch("/api/admin/orders/realtime", {
                cache: "no-store",
                signal: controller.signal,
              });
              if (!response.ok)
                throw new Error("Realtime authorization failed");
              callback(null, await response.json());
            } catch {
              callback("Realtime authorization failed", null);
            }
          },
        });
        client.connection.on((change) => {
          if (ended) return;
          setLive(change.current === "connected");
          if (change.current === "connected") changed();
        });
        await client.channels
          .get(ADMIN_ORDERS_CHANNEL)
          .subscribe(ORDER_UPDATED_EVENT, changed);
        changed();
      } catch {
        if (!ended) setLive(false);
      }
    }
    void refresh();
    void connect();
    const timer = window.setInterval(() => {
      void refresh();
    }, 10000);
    window.addEventListener("focus", changed);
    document.addEventListener("visibilitychange", changed);
    window.addEventListener("storage", onStorage);
    return () => {
      ended = true;
      controller.abort();
      client?.close();
      window.clearInterval(timer);
      window.removeEventListener("focus", changed);
      document.removeEventListener("visibilitychange", changed);
      window.removeEventListener("storage", onStorage);
      refreshRef.current = () => {};
    };
  }, [userId]);

  useEffect(() => {
    if (pathname === "/management/orders") setUnread(0);
    refreshRef.current();
  }, [pathname]);
  return { unread: pathname === "/management/orders" ? 0 : unread, live };
}
