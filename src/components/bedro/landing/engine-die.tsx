import { motion } from "framer-motion";
import { FileSearch, Handshake, Layers, Search, type LucideIcon } from "lucide-react";
import { EASE } from "../glass";

const CORES: { icon: LucideIcon; title: string; detail: string }[] = [
  { icon: FileSearch, title: "Specification", detail: "Every row parsed and validated" },
  { icon: Layers, title: "Demand pooling", detail: "Compatible demand only" },
  { icon: Search, title: "Supplier discovery", detail: "Shortlist with concrete gaps" },
  { icon: Handshake, title: "Negotiation", detail: "Email rounds, you approve" },
];

// Traces from the central agent core to each engine core (viewBox 0..100, core centres at 27/73).
const TRACES = ["M50 50 H38 V27 H32", "M50 50 H62 V27 H68", "M50 50 H38 V73 H32", "M50 50 H62 V73 H68"];

/** Hero visual: a semiconductor die whose four cores are BEDRO's intelligence engines. Pure SVG/CSS — no images. */
export function EngineDie() {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.45, ease: EASE }}
      className="engine-die relative mx-auto aspect-square w-full max-w-[460px]" aria-label="BEDRO intelligence engines" role="img">
      <div className="die-pins die-pins-x absolute inset-x-[16%] top-[3%] h-[6%]" aria-hidden />
      <div className="die-pins die-pins-x absolute inset-x-[16%] bottom-[3%] h-[6%]" aria-hidden />
      <div className="die-pins die-pins-y absolute inset-y-[16%] left-[3%] w-[6%]" aria-hidden />
      <div className="die-pins die-pins-y absolute inset-y-[16%] right-[3%] w-[6%]" aria-hidden />
      <div className="die-body absolute inset-[9%] rounded-[30px]">
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 size-full" aria-hidden>
          {TRACES.map((d, i) => (
            <motion.path key={d} d={d} fill="none" stroke="var(--primary)" strokeOpacity="0.45" strokeWidth="0.6"
              strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, delay: 1 + i * 0.12, ease: EASE }} />
          ))}
        </svg>
        <div className="relative grid size-full grid-cols-2 gap-[19%] p-[6%]">
          {CORES.map(({ icon: Icon, title, detail }, i) => (
            <motion.div key={title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.75 + i * 0.1, ease: EASE }}
              className="die-core flex flex-col justify-between rounded-2xl p-3.5">
              <span className="grid size-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
                <Icon className="size-4.5" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-semibold leading-tight">{title}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{detail}</span>
              </span>
            </motion.div>
          ))}
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.25, ease: EASE }}
          className="die-center absolute left-1/2 top-1/2 grid size-[16%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl text-center">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">Agent<br />core</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
