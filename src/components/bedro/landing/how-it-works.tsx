import { motion } from "framer-motion";
import { CheckCircle2, FileUp, Handshake, Scale, Search, type LucideIcon } from "lucide-react";
import { EASE } from "../glass";
import { eyebrow, reveal, revealDelay } from "./motion";

const STAGES: { icon: LucideIcon; title: string; body: string; detail: string }[] = [
  { icon: FileUp, title: "Upload requirements", body: "Drop a CSV or XLSX. Column variations are mapped and every row is validated on its own.",
    detail: "Each file becomes its own request" },
  { icon: Search, title: "Discover suppliers & alternatives", body: "Each item is matched against qualified offerings; the top three are shortlisted with their real gaps.",
    detail: "Substitutes flagged for qualification" },
  { icon: Scale, title: "Evaluate offers", body: "Prices, totals, lead times, MOQ and compliance are checked independently — not taken on trust.",
    detail: "Arithmetic and terms verified" },
  { icon: Handshake, title: "Negotiate autonomously", body: "The agent negotiates by email within your ceiling, with diminishing concessions and clear round limits.",
    detail: "Unclear replies go to you" },
  { icon: CheckCircle2, title: "Decide — you stay in control", body: "Agreed offers wait for your approval. Only then is the supplier notified of the outcome.",
    detail: "No automatic purchase orders" },
];

/** Five-stage visual journey from requirement file to buyer-approved sourcing decision. */
export function HowItWorks() {
  return (
    <section id="how" aria-labelledby="how-title" className="relative bg-secondary/50 px-5 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div {...reveal} className="max-w-2xl">
          <p className={eyebrow}>How it works</p>
          <h2 id="how-title" className="mt-3 text-4xl font-bold md:text-5xl">Five stages. One accountable decision.</h2>
          <p className="mt-4 text-lg text-muted-foreground">BEDRO automates the work between a requirement file and a sourcing decision — and leaves the decision with you.</p>
        </motion.div>

        <ol className="relative mt-16 grid gap-6 lg:grid-cols-5 lg:gap-5">
          {/* connector: horizontal on desktop, vertical spine on mobile */}
          <motion.span aria-hidden initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="absolute left-[10%] right-[10%] top-7 hidden h-px origin-left bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 lg:block" />
          <span aria-hidden className="absolute bottom-6 left-7 top-6 w-px bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10 lg:hidden" />
          {STAGES.map(({ icon: Icon, title, body, detail }, i) => (
            <motion.li key={title} {...revealDelay(i, 0.1)} className="relative flex gap-5 lg:block">
              <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl bg-card text-primary shadow-elegant ring-1 ring-primary/15 lg:mx-auto">
                <Icon className="size-6" aria-hidden />
                <span className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground">{i + 1}</span>
              </span>
              <div className="glass-capsule rounded-2xl p-5 lg:mt-6 lg:min-h-[220px]">
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                <p className="mt-3 text-xs font-semibold text-primary">{detail}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
