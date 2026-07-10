"use client";

import { motion, useScroll, useSpring } from "motion/react";

export function WebsiteScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed left-0 top-0 z-[60] h-1 w-full origin-left bg-primary"
      style={{ scaleX }}
    />
  );
}
