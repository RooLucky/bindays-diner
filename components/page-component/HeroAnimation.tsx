"use client";

import { type ReactNode } from "react";
import { useSiteMotion } from "@/hooks/use-site-motion";

export function HeroAnimation({ children }: { children: ReactNode }) {
  const { enabled: playing } = useSiteMotion();

  return (
    <div
      className="hero-animation relative isolate aspect-square w-full"
      data-playing={playing}
    >
      {children}
    </div>
  );
}
