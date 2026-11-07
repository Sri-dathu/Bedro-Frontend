import { Suspense, lazy, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { EngineDie } from "./landing/engine-die";
import { EASE, GlassButton } from "./glass";

// Loaded on the client after first paint: the static .hero-background fallback shows until (or instead of, if
// WebGL2 is unavailable) the canvas. The component pauses itself off-screen and honours prefers-reduced-motion.
const MicroSlats = lazy(() => import("@/components/MicroSlats"));

/** Hero entrance timing, coordinated with the landing navbar (which enters at 0–0.5 s). */
const up = (d: number) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay: d, ease: EASE },
});

export function Hero({ go }: { go: (id: string) => void }) {
  const lines = [["BUY", "LIKE", "AN", "ENTERPRISE."], ["COMPETE", "ON", "YOUR", "TERMS."]];
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  // Subtle parallax: copy and visual drift apart slightly as the hero scrolls away (off for reduced motion).
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -50]);
  const visualY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -110]);
  return (
    <section ref={ref} id="engines" aria-label="Intelligence engines"
      className="hero relative isolate flex min-h-[600px] items-center overflow-hidden pb-20 pt-28 md:min-h-[700px] md:pt-32">
      <div className="hero-background absolute inset-0 -z-20" aria-hidden>
        <Suspense fallback={null}>
          <MicroSlats
            preset="storm"
            color="#fcfcfc"
            glintColor="#8ea7d2"
            backgroundColor="#c5cecc"
            slatWidth={10}
            slatHeight={25}
            gap={3}
            roundness={0.75}
            interactive
            cursorStrength={1}
            cursorSize={40}
            swirl={0}
            trail={1.4}
            lean={0}
            intro
            scale={0.55}
            speed={1.6}
            direction={236}
            chop={1}
            stretch={0.3}
            glint={1.3}
            contrast={1.8}
            perspective={0.8}
            fog={0.35}
          />
        </Suspense>
      </div>
      {/* contrast veil: only behind the copy, fades out to let the slats show on the right */}
      <div className="hero-veil pointer-events-none absolute inset-0 -z-10" aria-hidden />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.08fr_0.92fr]">
        <motion.div style={{ y: copyY }}>
          <motion.span {...up(0.2)} className="glass-capsule inline-flex rounded-full px-3.5 py-1.5 text-xs font-semibold text-accent-foreground">
            Intelligence engines · Semiconductor procurement
          </motion.span>
          <h1 className="mt-6 text-[2.5rem] font-extrabold leading-[0.98] text-foreground sm:text-6xl md:text-7xl">
            {lines.map((ws, li) => (
              <span key={li} className={`block ${li ? "text-gradient" : ""}`}>
                {ws.map((w, wi) => (
                  <span key={w} className="inline-block overflow-hidden pb-1 align-bottom">
                    <motion.span className="inline-block" initial={{ y: "105%" }} animate={{ y: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 + li * 0.16 + wi * 0.05, ease: EASE }}>{w}&nbsp;</motion.span>
                  </span>
                ))}
              </span>
            ))}
          </h1>
          <motion.p {...up(0.75)} className="mt-6 max-w-lg text-lg text-foreground/75">
            Four intelligence engines read your requirement files, pool compatible demand, qualify suppliers and
            negotiate by email — then hand every award to you for the final decision.
          </motion.p>
          <div className="mt-8 flex flex-wrap gap-3">
            <motion.div {...up(0.9)}>
              <Link to="/workspace" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-elegant outline-none transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-glow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                Explore the Procurement Workspace <ArrowRight className="size-4" />
              </Link>
            </motion.div>
            <motion.div {...up(1)}>
              <GlassButton size="lg" variant="glass" onClick={() => go("how")}>How It Works</GlassButton>
            </motion.div>
          </div>
          <motion.p {...up(1.1)} className="mt-6 flex items-center gap-2 text-sm text-foreground/70">
            <ShieldCheck className="size-4 text-primary" aria-hidden />
            Every award requires your approval. Budgets and price ceilings are never shared with suppliers.
          </motion.p>
        </motion.div>
        <motion.div style={{ y: visualY }} className="hidden md:block">
          <EngineDie />
        </motion.div>
      </div>
    </section>
  );
}
