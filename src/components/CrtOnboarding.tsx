"use client";

import { useEffect, useRef, useState } from "react";

type Step = {
  title: string;
  body: string;
};

type CrtOnboardingProps = {
  eyebrow?: string;
  mark?: string;
  subtitle?: string;
  tagline?: string;
  steps?: Step[];
};

const DEFAULT_STEPS: Step[] = [
  { title: "Create your account", body: "Email verified — you're in." },
  {
    title: "Tell us who you're supporting",
    body: "Student, mentor, or organization — this shapes your dashboard.",
  },
  {
    title: "Set your first goal",
    body: "Pick a focus area so we can point you at the right resources.",
  },
  { title: "You're ready", body: "Head into the dashboard and start manifesting." },
];

const SCRAMBLE = "!<>-_\\/[]{}—=+*^?#0123456789";
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

function decodeIn(el: HTMLElement, duration: number) {
  const target = el.textContent ?? "";
  const totalFrames = Math.round(duration / 30);
  const revealAt = target
    .split("")
    .map((_, i) => Math.floor((i / target.length) * totalFrames * 0.7));

  let frame = 0;
  const timer = setInterval(() => {
    frame++;
    let out = "";
    for (let i = 0; i < target.length; i++) {
      const ch = target[i];
      if (ch === " ") {
        out += " ";
        continue;
      }
      out += frame >= revealAt[i] ? ch : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
    }
    el.textContent = out;
    if (frame >= totalFrames) {
      el.textContent = target;
      clearInterval(timer);
    }
  }, 30);
}

function pop(el: HTMLElement | null, reduceMotion: boolean) {
  if (!el || reduceMotion || !el.animate) return;
  el.animate(
    [{ transform: "scale(0.6)" }, { transform: "scale(1.15)" }, { transform: "scale(1)" }],
    { duration: 380, easing: SPRING },
  );
}

function ripple(btn: HTMLButtonElement, evt: React.MouseEvent, reduceMotion: boolean) {
  if (reduceMotion) return;
  const rect = btn.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 1.6;
  const span = document.createElement("span");
  span.className = "crt-onboard-ripple";
  span.style.width = span.style.height = `${size}px`;
  span.style.left = `${evt.clientX - rect.left - size / 2}px`;
  span.style.top = `${evt.clientY - rect.top - size / 2}px`;
  btn.appendChild(span);
  const anim = span.animate(
    [
      { transform: "scale(0)", opacity: 0.55 },
      { transform: "scale(1)", opacity: 0 },
    ],
    { duration: 500, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  );
  anim.onfinish = () => span.remove();
}

function submitPulse(screen: HTMLElement | null) {
  if (!screen) return;
  const overlay = document.createElement("div");
  overlay.className = "crt-onboard-pulse";
  screen.appendChild(overlay);
  const anim = overlay.animate(
    [
      { boxShadow: "0 0 0 0 rgba(45, 212, 232, 0.55)", opacity: 1 },
      { boxShadow: "0 0 0 18px rgba(45, 212, 232, 0)", opacity: 0 },
    ],
    { duration: 700, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
  );
  anim.onfinish = () => overlay.remove();
}

export default function CrtOnboarding({
  eyebrow = "AN INFRA777 SOCIAL-IMPACT INITIATIVE",
  mark = "A'M",
  subtitle = "ACTION MANIFESTED",
  tagline = "Every Learner Deserves Support. Let's get your account set up.",
  steps = DEFAULT_STEPS,
}: CrtOnboardingProps) {
  const [current, setCurrent] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const screenRef = useRef<HTMLDivElement>(null);
  const indexRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotionRef.current) return;

    document
      .querySelectorAll<HTMLElement>("[data-crt-decode]")
      .forEach((el) => {
        const delay = Number(el.dataset.crtDecode) || 0;
        setTimeout(() => decodeIn(el, 700), delay);
      });
  }, []);

  function advance(next: number) {
    const prev = current;
    setCurrent(next);
    requestAnimationFrame(() => {
      pop(indexRefs.current[next], reduceMotionRef.current);
      pop(indexRefs.current[prev], reduceMotionRef.current);
    });
  }

  function handleNext(evt: React.MouseEvent<HTMLButtonElement>) {
    ripple(evt.currentTarget, evt, reduceMotionRef.current);
    if (current < steps.length - 1) {
      advance(current + 1);
    } else {
      submitPulse(screenRef.current);
      setSubmitted(true);
    }
  }

  function handleBack(evt: React.MouseEvent<HTMLButtonElement>) {
    ripple(evt.currentTarget, evt, reduceMotionRef.current);
    if (current > 0) advance(current - 1);
  }

  function handleSkip(evt: React.MouseEvent<HTMLButtonElement>) {
    ripple(evt.currentTarget, evt, reduceMotionRef.current);
    advance(steps.length - 1);
  }

  const isLast = current === steps.length - 1;

  return (
    <section aria-label="Onboarding intro" className="crt-onboard relative py-14 sm:py-20">
      <style>{`
        .crt-onboard {
          --navy: #030812;
          --navy-deep: #0a1730;
          --white: #ffffff;
          --ice: #e8f3ff;
          --cyan: #2dd4e8;
          --cyan-hi: #7fecf7;
          --cyan-ink: #0f7f91;
          background: var(--navy);
          font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
        }
        .crt-onboard-screen {
          animation: crt-onboard-screen-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes crt-onboard-screen-in {
          from { opacity: 0; transform: scale(0.97) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes crt-onboard-step-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .crt-onboard-step {
          animation: crt-onboard-step-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
          transition: border-color 0.35s ${SPRING}, background 0.35s ${SPRING}, transform 0.35s ${SPRING};
        }
        .crt-onboard-index {
          transition: background 0.35s ${SPRING}, border-color 0.35s ${SPRING}, color 0.35s ${SPRING};
        }
        .crt-onboard-btn {
          position: relative;
          overflow: hidden;
          transition: background 0.2s ease, color 0.2s ease, transform 0.25s ${SPRING};
        }
        .crt-onboard-btn:hover { transform: translateY(-1px); }
        .crt-onboard-btn:active { transform: scale(0.94); }
        .crt-onboard-ripple {
          position: absolute;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.55);
          transform: scale(0);
          pointer-events: none;
        }
        .crt-onboard-pulse {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          pointer-events: none;
        }
        @media (prefers-reduced-motion: reduce) {
          .crt-onboard *, .crt-onboard *::before, .crt-onboard *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="mx-auto w-full max-w-xl px-5 sm:px-8">
        <div
          ref={screenRef}
          className="crt-onboard-screen relative overflow-hidden rounded-[2rem] border px-6 py-12 text-center sm:px-10"
          style={{
            borderColor: "rgba(45, 212, 232, 0.2)",
            background: "var(--navy-deep)",
            boxShadow: "inset 0 0 40px rgba(0, 0, 0, 0.35)",
          }}
        >
          <div className="relative">
            <p
              data-crt-decode="0"
              className="font-mono text-[11px] uppercase tracking-[0.35em] sm:text-xs"
              style={{ color: "rgba(127, 236, 247, 0.7)" }}
            >
              {eyebrow}
            </p>

            <p className="mt-5 text-4xl font-bold tracking-[0.05em] sm:text-5xl">
              <span
                data-crt-decode="150"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, var(--cyan-hi) 55%, var(--cyan) 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  textShadow: "0 0 12px rgba(45, 212, 232, 0.45), 0 0 30px rgba(45, 212, 232, 0.2)",
                }}
              >
                {mark}
              </span>
              <span
                aria-hidden="true"
                className="crt-cursor ml-1 inline-block"
                style={{ color: "var(--cyan-hi)" }}
              >
                _
              </span>
            </p>

            <p
              data-crt-decode="350"
              className="mt-2 font-mono text-xs uppercase tracking-[0.3em] sm:text-sm"
              style={{ color: "rgba(127, 236, 247, 0.8)" }}
            >
              {subtitle}
            </p>

            <p
              data-crt-decode="550"
              className="mx-auto mt-6 max-w-md font-mono text-xs leading-relaxed sm:text-sm"
              style={{ color: "rgba(232, 243, 255, 0.55)" }}
            >
              {tagline}
            </p>

            <ol className="mt-10 flex flex-col gap-3 text-left">
              {steps.map((step, i) => {
                const done = i < current;
                const active = i === current;
                return (
                  <li
                    key={step.title}
                    className="crt-onboard-step flex items-start gap-3 rounded-xl border px-4 py-4"
                    style={{
                      animationDelay: `${0.05 + i * 0.07}s`,
                      borderColor: active ? "rgba(45, 212, 232, 0.3)" : "rgba(45, 212, 232, 0.12)",
                      background: active ? "rgba(45, 212, 232, 0.08)" : "rgba(16, 26, 40, 0.6)",
                      transform: active ? "translateX(4px)" : "none",
                    }}
                  >
                    <span
                      ref={(el) => {
                        indexRefs.current[i] = el;
                      }}
                      className="crt-onboard-index grid h-7 w-7 flex-none place-items-center rounded-full border text-xs"
                      style={{
                        borderColor: active ? "var(--cyan)" : done ? "var(--cyan-hi)" : "var(--cyan-ink)",
                        background: active ? "var(--cyan)" : "transparent",
                        color: active ? "var(--navy)" : "var(--cyan-hi)",
                      }}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold tracking-[0.03em]" style={{ color: "var(--white)" }}>
                        {step.title}
                      </h3>
                      <p className="mt-1 text-xs leading-relaxed" style={{ color: "rgba(232, 243, 255, 0.55)" }}>
                        {step.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                disabled={current === 0 || submitted}
                onClick={handleBack}
                className="crt-onboard-btn rounded-full border px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] disabled:opacity-50"
                style={{ borderColor: "var(--cyan)", color: "var(--cyan-hi)", background: "transparent" }}
              >
                Back
              </button>
              <button
                type="button"
                disabled={submitted}
                onClick={handleNext}
                className="crt-onboard-btn rounded-full px-6 py-3 font-mono text-xs uppercase tracking-[0.08em] disabled:opacity-50"
                style={{ background: "var(--cyan)", color: "var(--navy)" }}
              >
                {submitted ? "Submitted" : isLast ? "Finish" : "Continue"}
              </button>
            </div>
            {!submitted && (
              <button
                type="button"
                onClick={handleSkip}
                className="mx-auto mt-5 block font-mono text-[11px] tracking-[0.05em] underline"
                style={{ color: "rgba(232, 243, 255, 0.4)" }}
              >
                Skip setup for now
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
