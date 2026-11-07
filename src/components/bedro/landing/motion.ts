import { EASE } from "../glass";

/** Shared landing-page motion: one easing, one duration scale, reveal once when ~15% is visible. */
export const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.6, ease: EASE },
} as const;

export const revealDelay = (i: number, step = 0.08) => ({ ...reveal, transition: { ...reveal.transition, delay: i * step } });

/** Smooth-scroll to a landing section (instant when the visitor prefers reduced motion). */
export const scrollToSection = (id: string) =>
  document.getElementById(id)?.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "start",
  });

/** Section heading block used by every landing section. */
export const eyebrow = "text-xs font-bold uppercase tracking-[0.18em] text-primary";
