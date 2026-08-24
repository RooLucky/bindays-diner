import "server-only";

import { randomUUID } from "node:crypto";

import Ably from "ably";
import { revalidatePath } from "next/cache";

import { getServerEnv } from "@/lib/env";
import type { ManagementCategorySlug } from "@/lib/management";
import {
  MENU_CONTENT_CHANNEL,
  MENU_CONTENT_UPDATED_EVENT,
  type MenuContentUpdatedMessage,
} from "@/lib/realtime-contracts";

const TOKEN_TTL_MS = 60 * 60 * 1_000;

const publicPathsByCategory: Record<ManagementCategorySlug, string[]> = {
  drinks: ["/drinks"],
  "add-ons": ["/add-ons"],
  "main-dish": ["/home", "/menu"],
  "student-meal": ["/student-meals"],
  promo: ["/promos"],
  "meal-of-the-day": ["/meal-of-the-day"],
  "best-seller": ["/best-seller"],
  "bilao-tray": ["/bilao"],
};

let ablyRest: Ably.Rest | undefined;

function getAblyRest() {
  const apiKey = getServerEnv().ABLY_API_KEY;

  if (!apiKey) {
    throw new Error("ABLY_API_KEY is not configured.");
  }

  ablyRest ??= new Ably.Rest({ key: apiKey, queryTime: true });
  return ablyRest;
}

export function isAblyRealtimeEnabled() {
  return Boolean(getServerEnv().ABLY_API_KEY);
}

export async function createPublicMenuTokenRequest() {
  return getAblyRest().auth.createTokenRequest({
    clientId: `public-menu-${randomUUID()}`,
    capability: {
      [MENU_CONTENT_CHANNEL]: ["subscribe"],
    },
    ttl: TOKEN_TTL_MS,
  });
}

function revalidatePublicPaths(categorySlug: ManagementCategorySlug) {
  for (const path of publicPathsByCategory[categorySlug]) {
    revalidatePath(path);
  }
}

export async function notifyPublicMenuContentUpdated(
  categorySlug: ManagementCategorySlug,
) {
  revalidatePublicPaths(categorySlug);

  if (!isAblyRealtimeEnabled()) {
    return false;
  }

  const message: MenuContentUpdatedMessage = {
    categorySlug,
    updatedAt: new Date().toISOString(),
  };

  try {
    await getAblyRest()
      .channels.get(MENU_CONTENT_CHANNEL)
      .publish(MENU_CONTENT_UPDATED_EVENT, message);
    return true;
  } catch (error) {
    console.warn("Unable to publish the menu content update.", error);
    return false;
  }
}
