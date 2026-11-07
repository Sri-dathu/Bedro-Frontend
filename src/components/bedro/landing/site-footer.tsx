import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

/** Enterprise footer: brand, product summary, section links and workspace access. No invented contact/legal links. */
export function SiteFooter({ sections, go }: { sections: readonly (readonly [string, string])[]; go: (id: string) => void }) {
  return (
    <footer className="relative border-t border-border/70 bg-gradient-to-b from-background to-secondary/60 px-5 pb-10 pt-16">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span aria-hidden className="grid size-8 grid-cols-2 gap-0.75 rounded-lg bg-gradient-primary p-1.25 shadow-elegant">
              {[0, 1, 2, 3].map((i) => <span key={i} className={`rounded-[2px] bg-primary-foreground ${i === 1 ? "opacity-60" : "opacity-95"}`} />)}
            </span>
            <span className="font-display text-xl font-bold tracking-tight">BEDRO<span className="text-primary">.</span></span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Autonomous procurement for semiconductor manufacturers — from requirement files to buyer-approved sourcing
            decisions, with every negotiation on record.
          </p>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-foreground">Explore</h2>
          <ul className="mt-4 space-y-2.5 text-sm">
            {sections.map(([l, id]) => (
              <li key={id}><button type="button" onClick={() => go(id)} className="rounded text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">{l}</button></li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-foreground">Workspace</h2>
          <p className="mt-4 text-sm text-muted-foreground">Upload requirements, follow negotiations and approve sourcing decisions.</p>
          <Link to="/workspace" className="mt-4 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
            Open Procurement Workspace <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} BEDRO</span>
        <span>Buyer approval required for every award.</span>
      </div>
    </footer>
  );
}
