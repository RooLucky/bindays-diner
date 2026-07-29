"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

import { cn } from "@/lib/utils";

const smoothEase = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.75, delay, ease: smoothEase }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerContainer({
  children,
  className,
  revealOnMount = false,
}: {
  children: ReactNode;
  className?: string;
  revealOnMount?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={revealOnMount ? "show" : undefined}
      whileInView={revealOnMount ? undefined : "show"}
      viewport={revealOnMount ? undefined : { once: true, amount: 0.12 }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: 0.09,
            delayChildren: 0.08,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: {
          opacity: 0,
          y: 76,
          scale: 0.88,
          rotateX: -14,
          filter: "blur(14px)",
        },
        show: {
          opacity: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          filter: "blur(0px)",
        },
      }}
      style={{ transformPerspective: 900 }}
      transition={{ duration: 0.85, ease: smoothEase }}
    >
      {children}
    </motion.div>
  );
}

export function ParallaxLayer({
  children,
  className,
  distance = 56,
  reverse = false,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
  reverse?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const travel = distance * 1.9;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion
      ? [0, 0]
      : reverse
        ? [-travel, travel]
        : [travel, -travel],
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    reduceMotion ? [1, 1, 1, 1] : [0, 1, 1, 0],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.22, 0.78, 1],
    reduceMotion ? [1, 1, 1, 1] : [0.58, 1.08, 1.08, 0.58],
  );
  const rotate = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduceMotion ? [0, 0, 0] : reverse ? [-14, 0, 14] : [14, 0, -14],
  );

  return (
    <motion.div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{ y, opacity, scale, rotate }}
    >
      {children}
    </motion.div>
  );
}
