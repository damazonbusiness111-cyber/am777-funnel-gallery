"use client";

import { useEffect, useState } from "react";
import type { FormEvent, PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "framer-motion";

type Stage = "loading" | "welcome" | "application" | "success";

type FormState = {
  name: string;
  email: string;
  experience: string;
  learningStyle: string;
  goals: string;
  direction: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  experience: "",
  learningStyle: "",
  goals: "",
  direction: "",
};

const PROGRAM_NAME = "InfraMind777 Free AI Starter Program — Founding Batch";
const SCRAMBLE = "!<>-_\\/[]{}—=+*^?#0123456789";
const STEP_INDEX: Record<Stage, number> = { loading: -1, welcome: 0, application: 1, success: 2 };

function useDecodeIn(text: string, active: boolean) {
  const [display, setDisplay] = useState(text);
  useEffect(() => {
    if (!active) {
      setDisplay(text);
      return;
    }
    const duration = 500;
    const totalFrames = Math.round(duration / 30);
    const revealAt = text.split("").map((_, i) => Math.floor((i / text.length) * totalFrames * 0.75));
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

const stageVariants = {
  initial: { opacity: 0, y: 14, filter: "blur(2px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(2px)" },
};

const fieldContainer = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fieldItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
};

const springPop = { type: "spring" as const, stiffness: 420, damping: 22 };

/** A button that leans slightly toward the pointer within its bounds ("magnetic" hover). */
function Magnetic({
  children,
  reduced,
  strength = 10,
}: {
  children: React.ReactNode;
  reduced: boolean;
  strength?: number;
}) {
  const x = useSpring(0, { stiffness: 300, damping: 20 });
  const y = useSpring(0, { stiffness: 300, damping: 20 });

  function onPointerMove(evt: ReactPointerEvent<HTMLDivElement>) {
    if (reduced) return;
    const rect = evt.currentTarget.getBoundingClientRect();
    x.set(((evt.clientX - rect.left) / rect.width - 0.5) * strength);
    y.set(((evt.clientY - rect.top) / rect.height - 0.5) * strength);
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

type CtaButtonProps = {
  children: React.ReactNode;
  reduced: boolean;
  type: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
};

function CtaButton({ children, reduced, ...props }: CtaButtonProps) {
  return (
    <Magnetic reduced={reduced}>
      <motion.button
        {...props}
        whileHover={reduced ? undefined : { y: -1, boxShadow: "0 10px 24px -8px var(--color-gold)" }}
        whileTap={reduced ? undefined : { scale: 0.94 }}
        transition={springPop}
        className="rounded-full bg-gold px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-midnight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-hi disabled:opacity-50"
      >
        {children}
      </motion.button>
    </Magnetic>
  );
}

function ProgressDots({ stage }: { stage: Stage }) {
  const active = STEP_INDEX[stage];
  return (
    <div className="mt-5 flex justify-center gap-1.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="relative h-[2px] w-5 overflow-hidden rounded-full bg-gold/[0.14]">
          {i <= active && (
            <motion.div
              layoutId={i === active ? "progress-active" : undefined}
              className="absolute inset-0 rounded-full bg-gold"
              transition={springPop}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function LoadingGate({ onEnter, reduced }: { onEnter: () => void; reduced: boolean }) {
  const [ready, setReady] = useState(reduced);
  const status = useDecodeIn(ready ? "Access granted" : "Verifying eligibility", !reduced);

  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-hi/70">
        InfraMind777
      </p>
      <p className="mt-3 font-mono text-xs tracking-[0.02em] text-parchment/70">{status}</p>

      <div className="relative mx-auto mt-4 h-[3px] w-full max-w-[14rem] overflow-hidden rounded-full bg-gold/[0.14]">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gold"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={reduced ? { duration: 0 } : { duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          onAnimationComplete={() => setReady(true)}
        />
      </div>

      <AnimatePresence mode="wait">
        {ready && (
          <motion.div
            key="invite"
            initial={reduced ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springPop}
          >
            <motion.p
              className="mt-6 text-2xl font-bold leading-snug tracking-[0.01em] text-ivory sm:text-3xl"
              style={{ textShadow: "0 0 5px rgba(216, 190, 122, 0.4), 0 0 16px rgba(184, 138, 59, 0.22)" }}
              animate={
                reduced
                  ? undefined
                  : { textShadow: [
                      "0 0 5px rgba(216, 190, 122, 0.4), 0 0 16px rgba(184, 138, 59, 0.22)",
                      "0 0 10px rgba(216, 190, 122, 0.7), 0 0 26px rgba(184, 138, 59, 0.4)",
                      "0 0 5px rgba(216, 190, 122, 0.4), 0 0 16px rgba(184, 138, 59, 0.22)",
                    ] }
              }
              transition={reduced ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            >
              You are invited — free!
            </motion.p>
            <p className="mx-auto mt-3 max-w-xs font-mono text-[11px] leading-relaxed text-parchment/55">
              A Founding Batch slot has opened up. No cost, no card — just an application.
            </p>
            <motion.div
              initial={reduced ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : 0.15, duration: 0.3 }}
              className="mt-5 flex justify-center"
            >
              <CtaButton type="button" reduced={reduced} onClick={onEnter} aria-label="Enter the free enrollment flow">
                Claim My Free Invite
              </CtaButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <motion.div variants={fieldItem}>{children}</motion.div>;
}

const fieldClass =
  "w-full rounded-lg border border-gold/20 bg-midnight/60 px-3 py-2 font-mono text-[13px] text-parchment placeholder:text-parchment/35 outline-none transition-[border-color,box-shadow] duration-200 focus-visible:border-gold focus-visible:shadow-[0_0_0_3px_rgba(184,138,59,0.15)]";
const labelClass = "mb-1 block font-mono text-[10px] uppercase tracking-[0.1em] text-gold-hi/80";

export default function InfraMindEnrollment() {
  const [stage, setStage] = useState<Stage>("loading");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const reduced = Boolean(useReducedMotion());

  const heading =
    stage === "welcome"
      ? PROGRAM_NAME
      : stage === "application"
        ? "Founding Batch Applicant"
        : stage === "success"
          ? "Your InfraMind777 Application Has Been Received"
          : "";
  const decodedHeading = useDecodeIn(heading, !reduced);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    const endpoint = process.env.NEXT_PUBLIC_INFRAMIND_FORM_ENDPOINT;

    if (endpoint) {
      setSubmitting(true);
      try {
        await fetch(endpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({ ...form, secret: process.env.NEXT_PUBLIC_INFRAMIND_FORM_SECRET }),
        });
      } catch {
        // no-cors gives no readable response either way; submission is best-effort.
      } finally {
        setSubmitting(false);
      }
    }

    setStage("success");
  }

  return (
    <section
      aria-label="Free AI Starter Program enrollment"
      className="relative bg-midnight py-10 font-mono sm:py-14"
    >
      <div className="mx-auto w-full max-w-sm px-5 sm:px-6">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="crt-screen relative overflow-hidden rounded-[2rem] border border-gold/20 px-5 py-8 text-center sm:px-7"
        >
          <div className="crt-vignette" aria-hidden="true" />
          <div className="crt-scanlines" aria-hidden="true" />
          <div className="crt-grain" aria-hidden="true" />
          <div className="relative">
          <AnimatePresence mode="popLayout" initial={false}>
            {stage === "loading" && (
              <motion.div
                key="loading"
                variants={stageVariants}
                initial="initial"
                animate="animate"
                exit={reduced ? undefined : "exit"}
                transition={{ duration: 0.26, ease: "easeOut" }}
              >
                <LoadingGate reduced={reduced} onEnter={() => setStage("welcome")} />
              </motion.div>
            )}

            {stage === "welcome" && (
              <motion.div
                key="welcome"
                variants={stageVariants}
                initial="initial"
                animate="animate"
                exit={reduced ? undefined : "exit"}
                transition={{ duration: 0.26, ease: "easeOut" }}
              >
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-hi/70"
                >
                  Free AI Starter Program
                </p>
                <p className="mt-3 text-xl font-bold leading-snug tracking-[0.01em] sm:text-2xl text-ivory">
                  {decodedHeading}
                  <motion.span
                    aria-hidden="true"
                    className="ml-1 inline-block text-gold-hi"
                    animate={reduced ? undefined : { opacity: [1, 1, 0, 0] }}
                    transition={reduced ? undefined : { duration: 1.1, repeat: Infinity, times: [0, 0.49, 0.5, 1] }}
                  >
                    _
                  </motion.span>
                </p>
                <p
                  className="mx-auto mt-3 max-w-xs font-mono text-xs leading-relaxed text-parchment/55"
                >
                  Free Founding Batch enrollment is open for applicants who want to build real skills with AI.
                </p>
                <p
                  className="mx-auto mt-3 max-w-xs font-mono text-[10px] leading-relaxed text-parchment/40"
                >
                  Subject to available founding-batch slots and application review. Submission does not
                  guarantee automatic acceptance.
                </p>
                <div className="mt-5 flex justify-center">
                  <CtaButton
                    type="button"
                    reduced={reduced}
                    onClick={() => setStage("application")}
                    aria-label="Start my free enrollment"
                  >
                    Start My Free Enrollment
                  </CtaButton>
                </div>
                <ProgressDots stage={stage} />
              </motion.div>
            )}

            {stage === "application" && (
              <motion.div
                key="application"
                variants={stageVariants}
                initial="initial"
                animate="animate"
                exit={reduced ? undefined : "exit"}
                transition={{ duration: 0.26, ease: "easeOut" }}
              >
                <p
                  className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold-hi/70"
                >
                  Free Program Application
                </p>
                <p className="mt-2 text-lg font-bold tracking-[0.01em] sm:text-xl text-ivory">
                  {decodedHeading}
                </p>
                <p
                  className="mx-auto mt-2 max-w-xs font-mono text-[11px] leading-relaxed text-parchment/55"
                >
                  A few questions on your goals, experience, and how you like to learn.
                </p>

                <motion.form
                  variants={fieldContainer}
                  initial="hidden"
                  animate="show"
                  onSubmit={handleSubmit}
                  className="mt-5 flex flex-col gap-3 text-left"
                >
                  <Field>
                    <label className={labelClass} htmlFor="name">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="Your full name"
                      className={fieldClass}
                    />
                  </Field>

                  <Field>
                    <label className={labelClass} htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      placeholder="you@example.com"
                      className={fieldClass}
                    />
                  </Field>

                  <Field>
                    <label className={labelClass} htmlFor="experience">
                      Current experience with AI
                    </label>
                    <select
                      id="experience"
                      required
                      value={form.experience}
                      onChange={(e) => update("experience", e.target.value)}
                      className={fieldClass}
                    >
                      <option value="" disabled>Select one</option>
                      <option value="new">New to AI</option>
                      <option value="some">Some experience</option>
                      <option value="experienced">Experienced</option>
                    </select>
                  </Field>

                  <Field>
                    <label className={labelClass} htmlFor="learningStyle">
                      Preferred learning approach
                    </label>
                    <select
                      id="learningStyle"
                      required
                      value={form.learningStyle}
                      onChange={(e) => update("learningStyle", e.target.value)}
                      className={fieldClass}
                    >
                      <option value="" disabled>Select one</option>
                      <option value="self-paced">Self-paced lessons</option>
                      <option value="guided">Guided cohort</option>
                      <option value="hands-on">Hands-on projects</option>
                      <option value="community">Community discussion</option>
                    </select>
                  </Field>

                  <Field>
                    <label className={labelClass} htmlFor="goals">
                      What are your goals?
                    </label>
                    <textarea
                      id="goals"
                      required
                      rows={2}
                      value={form.goals}
                      onChange={(e) => update("goals", e.target.value)}
                      placeholder="What do you want to get out of this program?"
                      className={fieldClass}
                    />
                  </Field>

                  <Field>
                    <label className={labelClass} htmlFor="direction">
                      What direction do you want to build using AI?
                    </label>
                    <textarea
                      id="direction"
                      required
                      rows={2}
                      value={form.direction}
                      onChange={(e) => update("direction", e.target.value)}
                      placeholder="A project, career path, or idea you want to explore"
                      className={fieldClass}
                    />
                  </Field>

                  <motion.div variants={fieldItem} className="mt-1 flex justify-center gap-2">
                    <Magnetic reduced={reduced}>
                      <motion.button
                        type="button"
                        onClick={() => setStage("welcome")}
                        whileHover={reduced ? undefined : { y: -1 }}
                        whileTap={reduced ? undefined : { scale: 0.94 }}
                        transition={springPop}
                        className="rounded-full border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] border-gold text-gold-hi bg-transparent"
                      >
                        Back
                      </motion.button>
                    </Magnetic>
                    <CtaButton
                      type="submit"
                      reduced={reduced}
                      disabled={submitting}
                      aria-label="Submit my free enrollment"
                    >
                      {submitting ? "Submitting…" : "Submit My Free Enrollment"}
                    </CtaButton>
                  </motion.div>
                </motion.form>
                <ProgressDots stage={stage} />
              </motion.div>
            )}

            {stage === "success" && (
              <motion.div
                key="success"
                variants={stageVariants}
                initial="initial"
                animate="animate"
                exit={reduced ? undefined : "exit"}
                transition={{ duration: 0.26, ease: "easeOut" }}
                role="status"
              >
                <motion.div
                  initial={reduced ? false : { opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={springPop}
                  className="mx-auto grid h-11 w-11 place-items-center rounded-full border text-base border-gold text-gold-hi bg-gold/[0.08]"
                >
                  ✓
                </motion.div>
                <p
                  className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-gold-hi/70"
                >
                  Free AI Enrollment
                </p>
                <p className="mt-2 text-lg font-bold leading-snug tracking-[0.01em] sm:text-xl text-ivory">
                  {decodedHeading}
                </p>
                <p
                  className="mx-auto mt-3 max-w-xs font-mono text-[11px] leading-relaxed text-parchment/55"
                >
                  Your application for the {PROGRAM_NAME} has been received. Your answers will be reviewed to
                  understand your goals, experience, learning approach, and the direction you want to build.
                </p>
                <p
                  className="mx-auto mt-3 max-w-xs font-mono text-[10px] leading-relaxed text-parchment/40"
                >
                  Subject to available founding-batch slots and application review. Submission does not
                  guarantee automatic acceptance.
                </p>
                <ProgressDots stage={stage} />
              </motion.div>
            )}
          </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
