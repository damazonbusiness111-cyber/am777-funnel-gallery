"use client";

import { useEffect, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useSpring } from "framer-motion";

type CrtIntroProps = {
  eyebrow?: string;
  mark?: string;
  subtitle?: string;
  tagline?: string;
};

const SCRAMBLE = "!<>-_\\/[]{}—=+*^?#0123456789";
const springPop = { type: "spring" as const, stiffness: 420, damping: 22 };

/** A link that leans slightly toward the pointer within its bounds ("magnetic" hover). */
function Magnetic({ children, reduced }: { children: React.ReactNode; reduced: boolean }) {
  const x = useSpring(0, { stiffness: 300, damping: 20 });
  const y = useSpring(0, { stiffness: 300, damping: 20 });

  function onPointerMove(evt: ReactPointerEvent<HTMLDivElement>) {
    if (reduced) return;
    const rect = evt.currentTarget.getBoundingClientRect();
    x.set(((evt.clientX - rect.left) / rect.width - 0.5) * 10);
    y.set(((evt.clientY - rect.top) / rect.height - 0.5) * 10);
  }

  function onPointerLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div style={{ x, y }} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave}>
      {children}
    </motion.div>
  );
}

function useDecodeIn(text: string, active: boolean) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!active) {
      setDisplay(text);
      return;
    }
    const duration = 700;
    const totalFrames = Math.round(duration / 30);
    const revealAt = text.split("").map((_, i) => Math.floor((i / text.length) * totalFrames * 0.7));
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      let out = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        out += ch === " " || frame >= revealAt[i] ? ch : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
      }
      setDisplay(out);
      if (frame >= totalFrames) {
        setDisplay(text);
        clearInterval(timer);
      }
    }, 30);
    return () => clearInterval(timer);
  }, [text, active]);
  return display;
}

export default function CrtIntro({
  eyebrow = "AN INFRA777 SOCIAL-IMPACT INITIATIVE",
  mark = "A'M",
  subtitle = "ACTION MANIFESTED",
  tagline = "Every Learner Deserves Support.",
}: CrtIntroProps) {
  const reduced = Boolean(useReducedMotion());
  const decodedMark = useDecodeIn(mark, !reduced);

  return (
    <section aria-label="Campaign intro" className="relative bg-midnight py-14 sm:py-20">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="crt-screen relative mx-auto overflow-hidden rounded-[2rem] border border-gold/20 px-6 py-14 text-center sm:px-12 sm:py-20"
        >
          <div className="crt-vignette" aria-hidden="true" />
          <div className="crt-scanlines" aria-hidden="true" />
          <div className="crt-grain" aria-hidden="true" />

          <motion.div
            className="relative"
            initial={reduced ? false : "hidden"}
            animate="show"
            variants={{ hidden: { opacity: 1 }, show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
          >
            <motion.p
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="font-mono text-[11px] uppercase tracking-[0.35em] text-gold-hi/70 sm:text-xs"
            >
              {eyebrow}
            </motion.p>

            <p className="crt-heading mt-6 text-5xl sm:text-6xl lg:text-7xl">
              {decodedMark}
              <motion.span
                className="crt-cursor-motion ml-1 inline-block text-gold-hi"
                aria-hidden="true"
                animate={reduced ? undefined : { opacity: [1, 1, 0, 0] }}
                transition={reduced ? undefined : { duration: 1.1, repeat: Infinity, times: [0, 0.49, 0.5, 1] }}
              >
                _
              </motion.span>
            </p>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-gold-hi/80 sm:text-sm"
            >
              {subtitle}
            </motion.p>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mx-auto mt-8 max-w-md font-mono text-xs leading-relaxed text-parchment/55 sm:text-sm"
            >
              {tagline}
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-8 flex justify-center"
            >
              <Magnetic reduced={reduced}>
                <Link href="/enroll" className="inline-block" aria-label="Continue to the free enrollment form">
                  <motion.span
                    whileHover={reduced ? undefined : { y: -1, boxShadow: "0 10px 24px -8px var(--color-gold)" }}
                    whileTap={reduced ? undefined : { scale: 0.94 }}
                    transition={springPop}
                    className="inline-block rounded-full bg-gold px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] text-midnight"
                  >
                    Continue
                  </motion.span>
                </Link>
              </Magnetic>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
