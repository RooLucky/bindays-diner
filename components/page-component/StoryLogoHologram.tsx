"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

export function StoryLogoHologram() {
  const columnRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: columnRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduceMotion ? [0, 0] : [44, -44],
  );
  const rotateX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduceMotion ? [0, 0, 0] : [5, 0, -5],
  );
  const rotateY = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduceMotion ? [0, 0, 0] : [-7, 0, 7],
  );
  const scale = useTransform(
    scrollYProgress,
    [0, 0.24, 0.76, 1],
    reduceMotion ? [1, 1, 1, 1] : [0.94, 1.02, 1.02, 0.94],
  );

  return (
    <div
      ref={columnRef}
      className="relative min-h-[30rem] self-stretch lg:min-h-0"
    >
      <div className="flex min-h-[30rem] items-center justify-center lg:sticky lg:top-24 lg:h-[calc(100dvh-7rem)]">
        <motion.div
          style={{ y, rotateX, rotateY, scale, transformPerspective: 1200 }}
          className="relative aspect-square w-full max-w-[35rem] will-change-transform"
        >
          <div className="story-hologram-beam absolute inset-x-[16%] bottom-[9%] top-[16%]" />
          <div className="story-hologram-orbit absolute inset-[5%] rounded-full border border-secondary/25" />
          <div className="story-hologram-orbit story-hologram-orbit-reverse absolute inset-[12%] rounded-full border border-primary/20" />

          <div className="story-hologram-panel absolute inset-x-[3%] top-1/2 z-10 -translate-y-1/2 overflow-hidden rounded-[2rem] border border-secondary/30 px-5 py-10 sm:px-8 sm:py-12">
            <div className="story-hologram-grid absolute inset-0" />
            <div className="story-hologram-scanline absolute inset-x-0 top-0 h-24" />

            <div className="relative z-10 mx-auto w-full max-w-[30rem]">
              <Image
                src="/images/web-logo.png"
                alt=""
                aria-hidden="true"
                width={1241}
                height={849}
                sizes="(max-width: 1023px) 84vw, 480px"
                className="absolute inset-0 h-auto w-full translate-x-1 opacity-20 [filter:hue-rotate(118deg)_saturate(1.7)]"
              />
              <Image
                src="/images/web-logo.png"
                alt=""
                aria-hidden="true"
                width={1241}
                height={849}
                sizes="(max-width: 1023px) 84vw, 480px"
                className="absolute inset-0 h-auto w-full -translate-x-1 opacity-15 [filter:hue-rotate(320deg)_saturate(1.8)]"
              />
              <Image
                src="/images/web-logo.png"
                alt="Binday's Diner — Every Meal Feels Like Home"
                width={1241}
                height={849}
                sizes="(max-width: 1023px) 84vw, 480px"
                className="story-hologram-logo relative h-auto w-full drop-shadow-[0_0_24px_rgba(194,145,38,0.32)]"
              />
            </div>

            <span className="story-hologram-particle absolute left-[14%] top-[23%] size-1.5 rounded-full bg-brand-gold" />
            <span className="story-hologram-particle absolute right-[17%] top-[31%] size-1 rounded-full bg-secondary" />
            <span className="story-hologram-particle absolute bottom-[24%] left-[22%] size-1 rounded-full bg-primary" />
            <span className="story-hologram-particle absolute bottom-[18%] right-[21%] size-1.5 rounded-full bg-brand-gold" />
          </div>

          <div className="absolute inset-x-[23%] bottom-[5%] z-20 h-5 rounded-[50%] border border-secondary/35 bg-secondary/10 shadow-[0_0_42px_rgba(105,119,44,0.24)]">
            <span className="absolute inset-x-[10%] -top-1 h-2 rounded-[50%] bg-brand-gold-soft shadow-[0_0_24px_rgba(196,151,47,0.55)]" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
