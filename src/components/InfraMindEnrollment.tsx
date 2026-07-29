"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent, PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion, useReducedMotion, useSpring } from "framer-motion";
import { START_ENROLLMENT_EVENT } from "@/lib/enrollmentEvents";

type Stage = "loading" | "welcome" | "application" | "signature" | "success";

type FormState = {
  name: string;
  email: string;
  experience: string;
  learningStyle: string;
  goals: string;
  direction: string;
  signature: string;
  agreed: boolean;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  experience: "",
  learningStyle: "",
  goals: "",
  direction: "",
  signature: "",
  agreed: false,
};

const PROGRAM_NAME = "InfraMind777 Free AI Starter Program — Founding Batch";
const STEP_TABS: { stage: Stage; label: string }[] = [
  { stage: "welcome", label: "Welcome" },
  { stage: "application", label: "Apply" },
  { stage: "signature", label: "Sign" },
  { stage: "success", label: "Done" },
];
const STEP_INDEX: Record<Stage, number> = {
  loading: -1,
  welcome: 0,
  application: 1,
  signature: 2,
  success: 3,
};

const stageVariants = {
  initial: { opacity: 0, x: 18 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -18 },
};

const fieldContainer = {
  hidden: { opacity: 1 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const fieldItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" as const } },
};

const premiumEase = [0.16, 1, 0.3, 1] as const;
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
        whileHover={reduced ? undefined : { y: -1, boxShadow: "0 10px 24px -8px var(--color-accent)" }}
        whileTap={reduced ? undefined : { scale: 0.94 }}
        transition={springPop}
        className="rounded-full bg-accent px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hi disabled:cursor-not-allowed disabled:opacity-50"
      >
        {children}
      </motion.button>
    </Magnetic>
  );
}

/** Tab-style step switcher. Clicking a completed step jumps back to it. */
function StepTabs({ stage, onJump }: { stage: Stage; onJump: (s: Stage) => void }) {
  const active = STEP_INDEX[stage];
  if (active < 0) return null;

  return (
    <div className="mt-5 flex justify-center gap-1 border-b border-silver-soft">
      {STEP_TABS.map(({ stage: s, label }) => {
        const idx = STEP_INDEX[s];
        const isActive = idx === active;
        const isDone = idx < active;
        const canJump = isDone && active < STEP_INDEX.success;
        return (
          <button
            key={s}
            type="button"
            disabled={!canJump}
            onClick={() => canJump && onJump(s)}
            className="relative px-3 py-2 text-[10px] uppercase tracking-[0.1em] transition-colors disabled:cursor-default"
            style={{ color: isActive ? "var(--color-accent)" : isDone ? "var(--color-ink)" : "var(--color-silver)" }}
          >
            {label}
            {isActive && (
              <motion.div
                layoutId="step-tab-underline"
                className="absolute inset-x-1 -bottom-px h-[2px] rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 500, damping: 34 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

function LoadingGate({ onEnter, reduced }: { onEnter: () => void; reduced: boolean }) {
  const [ready, setReady] = useState(reduced);
  const [stalled, setStalled] = useState(false);

  // Deterministic timers drive the state transition — the progress bar's own
  // width animation is purely cosmetic. Relying on Framer Motion's
  // onAnimationComplete here previously left visitors stuck on "Verifying
  // eligibility" forever in production (the callback did not reliably fire),
  // so this state is never allowed to hang: it resolves on its own, and a
  // hard fallback surfaces a manual way forward if it somehow doesn't.
  useEffect(() => {
    if (reduced) return;
    const resolve = setTimeout(() => setReady(true), 1400);
    const fallback = setTimeout(() => setStalled(true), 2000);
    return () => {
      clearTimeout(resolve);
      clearTimeout(fallback);
    };
  }, [reduced]);

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.3em] text-accent">InfraMind777</p>
      <p className="mt-3 text-xs tracking-[0.02em] text-ink/60">
        {ready ? "Access granted" : "Verifying eligibility"}
      </p>

      <div className="relative mx-auto mt-4 h-[3px] w-full max-w-[14rem] overflow-hidden rounded-full bg-silver-soft">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-accent"
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={reduced ? { duration: 0 } : { duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {stalled && !ready && (
        <div className="mt-5">
          <p className="mx-auto max-w-xs text-[11px] leading-relaxed text-ink/55">
            We couldn&apos;t finish the automatic check. You can still continue with your application.
          </p>
          <div className="mt-3 flex justify-center">
            <CtaButton type="button" reduced={reduced} onClick={onEnter} aria-label="Continue to the enrollment form">
              Continue Anyway
            </CtaButton>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {ready && (
          <motion.div
            key="invite"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springPop}
          >
            <p className="mt-6 text-2xl font-bold leading-snug tracking-tight text-ink sm:text-3xl">
              You are invited — free!
            </p>
            <p className="mx-auto mt-3 max-w-xs text-[11px] leading-relaxed text-ink/55">
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
  "w-full rounded-lg border border-silver-soft bg-white px-3 py-2 text-[13px] text-ink placeholder:text-ink/35 outline-none transition-[border-color,box-shadow,transform] duration-200 focus-visible:border-accent focus-visible:shadow-[0_0_0_3px_rgba(47,123,246,0.15)] focus-visible:scale-[1.01]";
const labelClass = "mb-1 block text-[10px] uppercase tracking-[0.1em] text-accent";

export default function InfraMindEnrollment() {
  const [stage, setStage] = useState<Stage>("loading");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const reduced = Boolean(useReducedMotion());
  const nameInputRef = useRef<HTMLInputElement>(null);

  // The hero CTA's promise is to start the application, not to scroll to an
  // inert section — jump straight past the loading/welcome theater into the
  // real form when it's clicked.
  useEffect(() => {
    function handleStart() {
      setStage("application");
    }
    window.addEventListener(START_ENROLLMENT_EVENT, handleStart);
    return () => window.removeEventListener(START_ENROLLMENT_EVENT, handleStart);
  }, []);

  useEffect(() => {
    if (stage === "application") nameInputRef.current?.focus();
  }, [stage]);

  const heading =
    stage === "welcome"
      ? PROGRAM_NAME
      : stage === "application"
        ? "Founding Batch Applicant"
        : stage === "signature"
          ? "Just One Last Step"
          : stage === "success"
            ? "Your InfraMind777 Application Has Been Received"
            : "";

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function goToSignature(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setStage("signature");
  }

  async function handleSign(evt: FormEvent<HTMLFormElement>) {
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
    <section aria-label="Free AI Starter Program enrollment" className="relative bg-surface py-10 sm:py-14">
      <div className="mx-auto w-full max-w-sm px-5 sm:px-6">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: premiumEase }}
          className="glow-panel relative overflow-hidden rounded-[2rem] border border-silver-soft px-5 py-8 text-center sm:px-7"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {stage === "loading" && (
              <motion.div
                key="loading"
                variants={stageVariants}
                initial="initial"
                animate="animate"
                exit={reduced ? undefined : "exit"}
                transition={{ duration: 0.32, ease: premiumEase }}
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
                transition={{ duration: 0.32, ease: premiumEase }}
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Free AI Starter Program</p>
                <p className="mt-3 text-xl font-bold leading-snug tracking-tight text-ink sm:text-2xl">{heading}</p>
                <p className="mx-auto mt-3 max-w-xs text-xs leading-relaxed text-ink/55">
                  Free Founding Batch enrollment is open for applicants who want to build real skills with AI.
                </p>
                <p className="mx-auto mt-3 max-w-xs text-[10px] leading-relaxed text-ink/40">
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
                <StepTabs stage={stage} onJump={setStage} />
              </motion.div>
            )}

            {stage === "application" && (
              <motion.div
                key="application"
                variants={stageVariants}
                initial="initial"
                animate="animate"
                exit={reduced ? undefined : "exit"}
                transition={{ duration: 0.32, ease: premiumEase }}
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Free Program Application</p>
                <p className="mt-2 text-lg font-bold tracking-tight text-ink sm:text-xl">{heading}</p>
                <p className="mx-auto mt-2 max-w-xs text-[11px] leading-relaxed text-ink/55">
                  A few questions on your goals, experience, and how you like to learn.
                </p>

                <motion.form
                  variants={fieldContainer}
                  initial="hidden"
                  animate="show"
                  onSubmit={goToSignature}
                  className="mt-5 flex flex-col gap-3 text-left"
                >
                  <Field>
                    <label className={labelClass} htmlFor="name">
                      Name
                    </label>
                    <input
                      id="name"
                      ref={nameInputRef}
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
                        className="rounded-full border border-accent bg-transparent px-5 py-2.5 text-[11px] uppercase tracking-[0.08em] text-accent"
                      >
                        Back
                      </motion.button>
                    </Magnetic>
                    <CtaButton type="submit" reduced={reduced} aria-label="Continue to sign your application">
                      Continue
                    </CtaButton>
                  </motion.div>
                </motion.form>
                <StepTabs stage={stage} onJump={setStage} />
              </motion.div>
            )}

            {stage === "signature" && (
              <motion.div
                key="signature"
                variants={stageVariants}
                initial="initial"
                animate="animate"
                exit={reduced ? undefined : "exit"}
                transition={{ duration: 0.32, ease: premiumEase }}
              >
                <p className="text-[10px] uppercase tracking-[0.3em] text-accent">Free Program Application</p>
                <p className="mt-2 text-lg font-bold tracking-tight text-ink sm:text-xl">{heading}</p>
                <p className="mx-auto mt-2 max-w-xs text-[11px] leading-relaxed text-ink/55">
                  Nothing scary here — just pop your name below to confirm this application is really from you.
                  That&apos;s it.
                </p>

                <motion.form
                  variants={fieldContainer}
                  initial="hidden"
                  animate="show"
                  onSubmit={handleSign}
                  className="mt-5 flex flex-col gap-3 text-left"
                >
                  <Field>
                    <label className={labelClass} htmlFor="signature">
                      Type your name to sign
                    </label>
                    <input
                      id="signature"
                      type="text"
                      required
                      value={form.signature}
                      onChange={(e) => update("signature", e.target.value)}
                      placeholder={form.name || "Your full name"}
                      style={{ fontStyle: "italic", fontSize: "16px" }}
                      className={fieldClass}
                    />
                  </Field>

                  <Field>
                    <label className="flex cursor-pointer items-start gap-2.5 text-left">
                      <input
                        type="checkbox"
                        required
                        checked={form.agreed}
                        onChange={(e) => update("agreed", e.target.checked)}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-[color:var(--color-accent)]"
                      />
                      <span className="text-[11px] leading-relaxed text-ink/70">
                        Yes, this is really me applying, and I&apos;d love a shot at a spot in the Founding Batch.
                      </span>
                    </label>
                  </Field>

                  <motion.div variants={fieldItem} className="mt-1 flex justify-center gap-2">
                    <Magnetic reduced={reduced}>
                      <motion.button
                        type="button"
                        onClick={() => setStage("application")}
                        whileHover={reduced ? undefined : { y: -1 }}
                        whileTap={reduced ? undefined : { scale: 0.94 }}
                        transition={springPop}
                        className="rounded-full border border-accent bg-transparent px-5 py-2.5 text-[11px] uppercase tracking-[0.08em] text-accent"
                      >
                        Back
                      </motion.button>
                    </Magnetic>
                    <CtaButton
                      type="submit"
                      reduced={reduced}
                      disabled={submitting}
                      aria-label="Sign and submit my free enrollment"
                    >
                      {submitting ? "Sending…" : "Sign & Submit"}
                    </CtaButton>
                  </motion.div>
                </motion.form>
                <StepTabs stage={stage} onJump={setStage} />
              </motion.div>
            )}

            {stage === "success" && (
              <motion.div
                key="success"
                variants={stageVariants}
                initial="initial"
                animate="animate"
                exit={reduced ? undefined : "exit"}
                transition={{ duration: 0.32, ease: premiumEase }}
                role="status"
              >
                <motion.div
                  initial={reduced ? false : { opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={springPop}
                  className="mx-auto grid h-11 w-11 place-items-center rounded-full border border-accent bg-accent/10 text-base text-accent"
                >
                  ✓
                </motion.div>
                <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-accent">Free AI Enrollment</p>
                <p className="mt-2 text-lg font-bold leading-snug tracking-tight text-ink sm:text-xl">{heading}</p>
                <p className="mx-auto mt-3 max-w-xs text-[11px] leading-relaxed text-ink/55">
                  Your application for the {PROGRAM_NAME} has been received. Your answers will be reviewed to
                  understand your goals, experience, learning approach, and the direction you want to build.
                </p>
                <p className="mx-auto mt-3 max-w-xs text-[10px] leading-relaxed text-ink/40">
                  Subject to available founding-batch slots and application review. Submission does not
                  guarantee automatic acceptance.
                </p>
                <StepTabs stage={stage} onJump={setStage} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
