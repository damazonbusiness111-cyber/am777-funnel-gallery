"use client";

import { motion, useReducedMotion } from "framer-motion";

export default function HeroCta({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const reduced = Boolean(useReducedMotion());
  return (
    <motion.a
      href={href}
      onClick={onClick}
      whileHover={reduced ? undefined : { y: -1 }}
      whileTap={reduced ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-hi"
    >
      {children}
    </motion.a>
  );
}
