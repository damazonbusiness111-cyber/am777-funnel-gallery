"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function HeroCta({ href, children }: { href: string; children: React.ReactNode }) {
  const reduced = Boolean(useReducedMotion());
  return (
    <motion.a
      href={href}
      whileHover={reduced ? undefined : { y: -1 }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="rounded-full bg-gold px-6 py-3 text-xs uppercase tracking-[0.08em] text-midnight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-hi"
    >
      {children}
    </motion.a>
  );
}
