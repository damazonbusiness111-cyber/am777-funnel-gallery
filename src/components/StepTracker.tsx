—"use client";

import { motion } from "framer-motion";

type StepTrackerProps = {
    steps: string[];
    activeIndex: number;
};

export default function StepTracker({ steps, activeIndex }: StepTrackerProps) {
    if (activeIndex < 0) return null;

  return (
        <div className="flex items-center justify-center gap-1.5 py-1" role="list" aria-label="Onboarding progress">
          {steps.map((label, i) => {
                  const done = i < activeIndex;
                  const active = i === activeIndex;
                  const lineFilled = i < activeIndex;
          
                  return (
                              <div key={label} className="flex items-center gap-1.5" role="listitem">
                                          <motion.div
                                                          className={["tracker-node", done ? "is-done" : "", active ? "is-active" : ""].join(" ")}
                                                          initial={false}
                                                          animate={done || active ? { scale: [1.35, 1] } : { scale: 1 }}
                                                          transition={{ type: "spring", stiffness: 420, damping: 22 }}
                                                          title={label}
                                                          style={{ position: "relative" }}
                                                        >
                                          
                                            {done && (
                                                                          <motion.span
                                                                                              initial={{ opacity: 0, scale: 0.3 }}
                                                                                              animate={{ opacity: 1, scale: 1 }}
                                                                                              transition={{ type: "spring", stiffness: 420, damping: 22 }}
                                                                                              style={{
                                                                                                                    position: "absolute",
                                                                                                                    inset: 0,
                                                                                                                    display: "flex",
                                                                                                                    alignItems: "center",
                                                                                                                    justifyContent: "center",
                                                                                                                    fontSize: "8px",
                                                                                                                    color: "#04101f",
                                                                                                }}
                                                                                            >
                                                                            {String.fromCharCode(10003)}
                                                                          </motion.span>
                                                                        )}
                                          </motion.div>
                              
                                {i < steps.length - 1 && (
                                              <span className="tracker-line" aria-hidden="true">
                                                              <motion.span
                                                                                  className="tracker-line-fill"
                                                                                  initial={false}
                                                                                  animate={{ width: lineFilled ? "100%" : "0%" }}
                                                                                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                                                                                  style={{ display: "block", height: "100%" }}
                                                                                />
                                              </span>
                                          )}
                              </div>
                            );
        })}
        </div>
      );
}
</div>
