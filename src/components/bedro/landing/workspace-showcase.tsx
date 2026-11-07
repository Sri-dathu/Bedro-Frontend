import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, FileUp, Handshake, Layers, LayoutDashboard, Search, ShieldCheck, type LucideIcon } from "lucide-react";
import { eyebrow, reveal, revealDelay } from "./motion";

const SIDEBAR: [LucideIcon, string][] = [
  [LayoutDashboard, "Overview"], [FileUp, "Requirements"], [Layers, "Demand Pooling"],
  [Search, "Sourcing Options"], [Handshake, "Negotiations"], [CheckCircle2, "Sourcing Decision"],
];
// Illustrative content only (labelled in the frame): generic suppliers and parts, no real data.
const ROWS = [["300 mm P-type wafer", "500 wafers", "Validated"], ["Photoresist KrF", "40 L", "Validated"], ["Bonding wire Au 25 µm", "12 km", "Needs review"]];
const SHORTLIST = [["Supplier A", 92, "Meets all checks"], ["Supplier B", 87, "Lead time 42 d"], ["Supplier C", 81, "MOQ 1,000"]] as const;
const TIMELINE = [["R1", "Opening proposal sent"], ["R1", "Supplier counteroffer read"], ["R2", "Agent counteroffer sent"], ["R2", "Supplier accepts — awaiting you"]];
const POINTS: [LucideIcon, string, string][] = [
  [FileUp, "Every upload is its own request", "Each CSV or XLSX becomes a separate procurement request with its own lifecycle and history."],
  [Search, "Evidence, not scores", "Shortlists show the concrete gaps — MOQ, stock, lead time, compliance — behind each supplier."],
  [ShieldCheck, "You make the call", "The agent negotiates within your limits; nothing is awarded until you approve the final offer."],
];

/** Homepage preview of the procurement workspace (marketing illustration — the real workspace lives at /workspace). */
export function WorkspaceShowcase() {
  return (
    <section id="workspace" aria-labelledby="workspace-title" className="relative overflow-hidden px-5 py-24 md:py-32">
      <div className="section-glow pointer-events-none absolute inset-x-0 top-0 h-[480px]" aria-hidden />
      <div className="relative mx-auto max-w-6xl">
        <motion.div {...reveal} className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className={eyebrow}>Procurement workspace</p>
            <h2 id="workspace-title" className="mt-3 text-4xl font-bold md:text-5xl">From requirement file to sourcing decision — in one workspace.</h2>
            <p className="mt-4 text-lg text-muted-foreground">Upload requirements, compare qualified suppliers, follow every negotiation round and approve the outcome, with the full supplier conversation beside it.</p>
          </div>
          <Link to="/workspace" className="inline-flex h-12 items-center gap-2 rounded-full bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-elegant outline-none transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-glow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Open Procurement Workspace <ArrowRight className="size-4" />
          </Link>
        </motion.div>

        <motion.div {...revealDelay(1)} className="preview-frame mt-12 overflow-hidden rounded-[28px]">
          <div className="flex items-center gap-2 border-b border-border/60 px-5 py-3">
            {["bg-red-300", "bg-amber-300", "bg-emerald-300"].map((c) => <span key={c} className={`size-2.5 rounded-full ${c}`} aria-hidden />)}
            <span className="ml-3 text-xs font-medium text-muted-foreground">Procurement Workspace</span>
            <span className="ml-auto rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground">Illustrative preview</span>
          </div>
          <div className="grid md:grid-cols-[190px_1fr]">
            <ul className="hidden space-y-1 border-r border-border/60 p-3 md:block" aria-hidden>
              {SIDEBAR.map(([Icon, l], i) => (
                <li key={l} className={`flex items-center gap-2.5 rounded-full px-3 py-2 text-xs font-medium ${i === 4 ? "glass-segment-active text-accent-foreground" : "text-muted-foreground"}`}>
                  <Icon className={`size-3.5 ${i === 4 ? "text-primary" : ""}`} />{l}
                </li>
              ))}
            </ul>
            <div className="grid gap-4 p-4 md:p-6 lg:grid-cols-2">
              <Panel title="Request PR-2026-014" tag="3 requirements">
                <ul className="divide-y divide-border/60 text-xs">
                  {ROWS.map(([m, q, s]) => (
                    <li key={m} className="flex items-center justify-between gap-3 py-2.5">
                      <span className="min-w-0 truncate font-medium">{m}</span>
                      <span className="flex shrink-0 items-center gap-2"><span className="text-muted-foreground">{q}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s === "Validated" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{s}</span></span>
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel title="Shortlisted suppliers" tag="Top 3">
                <ul className="space-y-2.5 text-xs">
                  {SHORTLIST.map(([n, fit, gap], i) => (
                    <li key={n}>
                      <div className="flex justify-between"><span className="font-medium">#{i + 1} {n}</span><span className="text-muted-foreground">{gap}</span></div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-secondary">
                        <motion.div className="h-full rounded-full bg-gradient-primary" initial={{ width: 0 }} whileInView={{ width: `${fit}%` }}
                          viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.2 + i * 0.1 }} />
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
              <Panel title="Negotiation · Supplier A" tag="Round 2 of 5">
                <ol className="relative space-y-2.5 border-l border-primary/25 pl-4 text-xs">
                  {TIMELINE.map(([r, t], i) => (
                    <li key={t} className="relative">
                      <span className={`absolute -left-[21px] top-1 size-2 rounded-full ${i === TIMELINE.length - 1 ? "bg-primary shadow-glow" : "bg-primary/40"}`} />
                      <span className="mr-2 font-semibold text-primary">{r}</span>{t}
                    </li>
                  ))}
                </ol>
              </Panel>
              <Panel title="Sourcing decision" tag="Awaiting you">
                <dl className="grid grid-cols-3 gap-2 text-xs">
                  {[["Unit price", "Agreed"], ["Delivery", "30 days"], ["Checks", "All passed"]].map(([k, v]) => (
                    <div key={k} className="rounded-xl bg-secondary/70 p-2.5"><dt className="text-muted-foreground">{k}</dt><dd className="mt-0.5 font-semibold">{v}</dd></div>
                  ))}
                </dl>
                <div className="mt-3 flex gap-2" aria-hidden>
                  <span className="rounded-full bg-gradient-primary px-3.5 py-1.5 text-[11px] font-semibold text-primary-foreground">Accept offer</span>
                  <span className="rounded-full border px-3.5 py-1.5 text-[11px] font-semibold">Decline</span>
                </div>
              </Panel>
            </div>
          </div>
        </motion.div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {POINTS.map(([Icon, t, d], i) => (
            <motion.div key={t} {...revealDelay(i + 2)} className="rounded-2xl p-1">
              <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary"><Icon className="size-5" aria-hidden /></span>
              <h3 className="mt-4 font-semibold">{t}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{d}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Panel({ title, tag, children }: { title: string; tag: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/85 p-4 shadow-[var(--shadow-soft)]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-sm font-semibold">{title}</span>
        <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{tag}</span>
      </div>
      {children}
    </div>
  );
}
