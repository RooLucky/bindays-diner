"use client";

import { useEffect, useState } from "react";

export function useViewedOrders(userId: string) {
  const prefix = `bindays-order-viewed:${userId}:`;
  const [viewed, setViewed] = useState<Set<string> | null>(null);

  useEffect(() => {
    const ids = new Set<string>();
    try {
      for (let index = 0; index < localStorage.length; index++) {
        const key = localStorage.key(index);
        if (key?.startsWith(prefix)) ids.add(key.slice(prefix.length));
      }
    } catch {
      // Keep view tracking available in memory when storage is disabled.
    }
    setViewed(ids);
    const sync = (event: StorageEvent) => {
      if (event.key?.startsWith(prefix) && event.newValue === "1") {
        const id = event.key.slice(prefix.length);
        setViewed((current) => new Set([...(current ?? []), id]));
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [prefix]);

  function markViewed(id: string) {
    setViewed((current) => new Set([...(current ?? []), id]));
    try {
      localStorage.setItem(`${prefix}${id}`, "1");
    } catch {
      // The badge still clears for the current visit.
    }
  }

  return { isNew: (id: string) => viewed !== null && !viewed.has(id), markViewed };
}
