"use client";

import { useEffect, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, useSpring } from "framer-motion";

type CrtIntroProps = {
  eyebrow?: string;
  mark?: string;
  subtitle?: string;
  tagline?: string;
};

const SCRAMBLE = "!<>-_\\/[]{}—=+*^?#0123456789";
const springPop = { type: "spring" as const, stiffness: 420, damping: 22 };

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

/** A button that leans slightly toward the pointer within its bounds ("magnetic" hover). */
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

export default function CrtIntro({
  eyebrow = "AN INFRA777 SOCIAL-IMPACT INITIATIVE",
  mark = "InfraMind777",
  subtitle = "ACTION MANIFESTED",
  tagline = "Every Learner Deserves Support.",
}: CrtIntroProps) {
  const reduced = Boolean(useReducedMotion());
  const decodedMark = useDecodeIn(mark, !reduced);
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  function goToEnroll() {
    if (leaving) return;
    if (reduced) {
      router.push("/enroll");
      return;
    }
    setLeaving(true);
  }

  return (
    <section aria-label="Campaign intro" className="relative overflow-hidden bg-surface py-14 sm:py-20">
      {/* Ambient tech glow, echoing the InfraMind777 hexagon halo */}
      {!reduced && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: "radial-gradient(closest-side, rgba(47,123,246,0.16), transparent)" }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      <div className="relative mx-auto w-full max-w-3xl px-5 sm:px-8">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10, scale: 0.97 }}
          animate={
            leaving
              ? { opacity: 0, y: -10, scale: 0.97, filter: "blur(4px)" }
              : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
          }
          transition={{ duration: leaving ? 0.35 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => {
            if (leaving) router.push("/enroll");
          }}
          className="glow-panel relative mx-auto overflow-hidden rounded-[2rem] border border-silver-soft px-6 py-14 text-center sm:px-12 sm:py-20"
        >
          {/* Faint scanning light sweep for a HUD-ish, futuristic feel */}
          {!reduced && (
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 h-24"
              style={{ background: "linear-gradient(to bottom, transparent, rgba(47,123,246,0.06), transparent)" }}
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            />
          )}

          <motion.div
            className="relative"
            initial={reduced ? false : "hidden"}
            animate="show"
            variants={{ hidden: { opacity: 1 }, show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } } }}
          >
            <motion.p
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-[11px] uppercase tracking-[0.35em] text-accent sm:text-xs"
            >
              {eyebrow}
            </motion.p>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="mt-6 text-4xl font-bold tracking-tight text-ink sm:text-6xl"
            >
              <motion.span
                animate={
                  reduced
                    ? undefined
                    : {
                        textShadow: [
                          "0 0 0px rgba(47,123,246,0)",
                          "0 0 24px rgba(47,123,246,0.35)",
                          "0 0 0px rgba(47,123,246,0)",
                        ],
                      }
                }
                transition={reduced ? undefined : { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                {decodedMark}
              </motion.span>
              <motion.span
                aria-hidden="true"
                className="ml-1 inline-block text-accent"
                animate={reduced ? undefined : { opacity: [1, 1, 0, 0] }}
                transition={reduced ? undefined : { duration: 1.1, repeat: Infinity, times: [0, 0.49, 0.5, 1] }}
              >
                _
              </motion.span>
            </motion.p>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-3 text-xs uppercase tracking-[0.3em] text-silver sm:text-sm"
            >
              {subtitle}
            </motion.p>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-ink/60"
            >
              {tagline}
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mt-8 flex justify-center"
            >
              <Magnetic reduced={reduced}>
                <motion.button
                  type="button"
                  onClick={goToEnroll}
                  disabled={leaving}
                  aria-label="Continue to the free enrollment form"
                  whileHover={reduced ? undefined : { y: -1, boxShadow: "0 10px 28px -6px var(--color-accent)" }}
                  whileTap={reduced ? undefined : { scale: 0.94 }}
                  transition={springPop}
                  className="inline-block rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-60"
                >
                  Continue
                </motion.button>
              </Magnetic>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
