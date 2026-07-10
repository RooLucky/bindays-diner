"use client";

import { startTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Ably from "ably";
import type { InboundMessage } from "ably";

import {
  MENU_CONTENT_CHANNEL,
  MENU_CONTENT_UPDATED_EVENT,
  type MenuContentUpdatedMessage,
} from "@/lib/realtime-contracts";

type PublicMenuRealtimeRefreshProps = {
  categories: readonly string[];
};

function isMenuContentUpdate(value: unknown): value is MenuContentUpdatedMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<MenuContentUpdatedMessage>;
  return (
    typeof message.categorySlug === "string" &&
    typeof message.updatedAt === "string"
  );
}

export function PublicMenuRealtimeRefresh({
  categories,
}: PublicMenuRealtimeRefreshProps) {
  const router = useRouter();
  const lastRefreshAt = useRef(0);

  useEffect(() => {
    const realtime = new Ably.Realtime({
      authUrl: "/api/realtime/token",
      authMethod: "GET",
      useTokenAuth: true,
    });
    const channel = realtime.channels.get(MENU_CONTENT_CHANNEL);
    const handleUpdate = (message: InboundMessage) => {
      if (!isMenuContentUpdate(message.data)) {
        return;
      }

      if (!categories.includes(message.data.categorySlug)) {
        return;
      }

      const now = Date.now();

      if (now - lastRefreshAt.current < 500) {
        return;
      }

      lastRefreshAt.current = now;
      startTransition(() => router.refresh());
    };

    void channel
      .subscribe(MENU_CONTENT_UPDATED_EVENT, handleUpdate)
      .catch(() => undefined);

    return () => {
      channel.unsubscribe(MENU_CONTENT_UPDATED_EVENT, handleUpdate);
      realtime.close();
    };
  }, [categories, router]);

  return null;
}
