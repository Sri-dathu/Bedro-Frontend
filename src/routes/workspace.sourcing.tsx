import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, Check, Trophy, GitCompare, Sparkles, ChevronDown } from "lucide-react";
import { GlassSegmentedControl } from "@/components/bedro/glass";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Pill, money } from "@/components/bedro/ui";
import { CheckList } from "@/components/bedro/checks";
import { ErrorNotice, LoadingNotice, describeApiError } from "@/components/bedro/query-notice";
import { useRequirements } from "@/services/requirements";
import { usePools } from "@/services/pooling";
import {
  clearSupplierSelection,
  invalidateNegotiations,
  matchesQuery,
  saveSupplierSelection,
  startNegotiation,
  type Candidate,
  type SubjectType,
} from "@/services/negotiations";
import { invalidateRequests } from "@/services/procurement";
import { communicationsQuery, invalidateEmail, notifyMessageOutcome } from "@/services/email";
import { toast } from "sonner";

export const Route = createFileRoute("/workspace/sourcing")({ component: Sourcing });

type Subject = { type: SubjectType; id: string; title: string; sub: string };

function Sourcing() {
  const req = useRequirements();
  const pools = usePools();
  const [active, setActive] = useState<string | null>(null);

  const subjects: Subject[] = [
    // human in the loop: a pool is offered for negotiation only after the buyer approved it in Demand Pooling
    ...(pools.data ?? []).filter((p) => p.approval_status === "approved").map((p) => ({
      type: "demand_pool" as const,
      id: p.id,
      title: p.material_name,
      sub: `Pool · ${p.aggregate_quantity.toLocaleString()} ${p.unit_of_measure} · ${p.member_count} items`,
    })),
    ...Object.values(req.data?.items ?? {}).map((i) => ({
      type: "requirement_item" as const,
      id: i.id,
      title: i.part,
      sub: `${i.quantity?.toLocaleString()} ${i.unit} · ${i.sourceRequirementId ?? `row ${i.rowNumber}`}`,
    })),
  ];
  // Explicit scope: with several items/pools nothing is chosen until the buyer clicks one, and a selection that no
  // longer exists is never silently replaced by another item. A single subject is unambiguous and is used as is.
  const subject =
    subjects.find((s) => s.id === active) ?? (subjects.length === 1 ? subjects[0] : undefined);
  const header = (
    <PageHeader
      title="Sourcing Options"
      description="Suppliers are checked against every hard requirement first; only fully eligible suppliers are ranked, and at most three are shortlisted. Catalogue prices are indicative, not quotes."
    />
  );

  if (req.isPending)
    return (
      <>
        {header}
        <LoadingNotice>Loading requirements…</LoadingNotice>
      </>
    );
  if (req.isError)
    return (
      <>
        {header}
        <ErrorNotice
          title="Requirements unavailable."
          error={req.error}
          onRetry={() => req.refetch()}
        />
      </>
    );
  if (!subjects.length)
    return (
      <>
        {header}
        <Empty
          icon={<Search className="size-5" />}
          title="No validated line items"
          body="Upload requirements to see eligible suppliers."
          action={
            <Button asChild>
              <Link to="/workspace/requirements">Upload Requirements</Link>
            </Button>
          }
        />
      </>
    );

  return (
    <>
      {header}
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="surface h-fit p-2" role="listbox" aria-label="Line items and pools">
          {subjects.map((s) => (
            <button
              key={s.id}
              role="option"
              aria-selected={s.id === subject?.id}
              onClick={() => setActive(s.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${s.id === subject?.id ? "bg-accent text-accent-foreground" : "hover:bg-secondary"}`}
            >
              <div className="truncate font-medium">{s.title}</div>
              <div className="text-xs text-muted-foreground">{s.sub}</div>
            </button>
          ))}
        </div>
        {subject ? (
          <SubjectMatches key={subject.id} subject={subject} />
        ) : (
          <p className="surface h-fit p-5 text-sm text-muted-foreground">
            Select a line item or pool on the left. A negotiation covers only what you select: one
            item, or one pool and its member items.
          </p>
        )}
      </div>
    </>
  );
}

function SubjectMatches({ subject }: { subject: Subject }) {
  const qc = useQueryClient();
  const nav = useNavigate();
  const q = useQuery(matchesQuery(subject.type, subject.id));
  const [view, setView] = useState<"shortlist" | "alternatives">("shortlist");
  const [poolSelected, setPoolSelected] = useState<string | null>(null); // pools: not persisted (per-requirement only)
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const persisted = subject.type === "requirement_item";
  const selected = persisted ? (q.data?.selection?.offering_id ?? null) : poolSelected;

  /** Requirement items: the choice is saved on the backend (bound to this requirement and its request) and shown only
   *  after the backend confirms it. Selecting never starts a negotiation. */
  async function choose(c: Candidate) {
    if (!persisted) return setPoolSelected(c.offering_id);
    if (!q.data?.request_id || c.offering_id === selected) return;
    setBusy(true);
    setError(null);
    try {
      const sel = await saveSupplierSelection(subject.id, {
        request_id: q.data.request_id,
        offering_id: c.offering_id,
        supplier_id: c.supplier_id,
      });
      qc.setQueryData(matchesQuery(subject.type, subject.id).queryKey, (old) =>
        old ? { ...old, selection: sel } : old,
      );
      toast.success(`Selected supplier saved: ${sel.company_name}`, {
        id: `selection-${subject.id}`,
        description:
          "No negotiation was started. Use Negotiate Using Agent or Start Negotiation when ready.",
      });
      await invalidateRequests(qc);
    } catch (e) {
      setError(describeApiError(e));
    }
    setBusy(false);
  }
  async function clearChoice() {
    if (!q.data?.request_id) return;
    setBusy(true);
    setError(null);
    try {
      await clearSupplierSelection(subject.id, q.data.request_id);
      qc.setQueryData(matchesQuery(subject.type, subject.id).queryKey, (old) =>
        old ? { ...old, selection: null } : old,
      );
      await invalidateRequests(qc);
    } catch (e) {
      setError(describeApiError(e));
    }
    setBusy(false);
  }

  async function start(body: { offering_id: string } | { auto_select: true }) {
    setBusy(true);
    setError(null);
    try {
      const n = await startNegotiation({
        subject_type: subject.type,
        subject_id: subject.id,
        ...body,
      });
      toast.success(`Negotiation started with ${n.company_name}`, {
        id: `negotiation-${n.id}`,
        description: `Scope: ${scope} only.`,
      });
      if (n.mode.startsWith("email_")) {
        // the agent may already have emailed the opening proposal: report the backend's recorded outcome
        const [m] = (await qc.fetchQuery(communicationsQuery(n.id))).filter(
          (x) => x.direction === "outbound",
        );
        if (m) notifyMessageOutcome(m);
      }
      await Promise.all([invalidateNegotiations(qc), invalidateEmail(qc)]);
      nav({ to: "/workspace/negotiations" });
    } catch (e) {
      const msg = describeApiError(e);
      setError(msg);
      setBusy(false);
      toast.error("Negotiation not started", { id: `start-${subject.id}`, description: msg });
    }
  }
  const scope =
    subject.type === "demand_pool"
      ? `pool “${subject.title}” (${subject.sub.split(" · ").pop()})`
      : `item “${subject.title}”`;

  if (q.isPending) return <LoadingNotice>Checking supplier eligibility…</LoadingNotice>;
  if (q.isError)
    return (
      <ErrorNotice
        title="Supplier matching unavailable."
        error={q.error}
        onRetry={() => q.refetch()}
      />
    );
  const m = q.data;
  const alternatives = m.ineligible.filter((c) =>
    c.checks.some((x) => x.check === "material" && x.status === "fail"),
  );
  const notSelectable = [
    ...m.needs_review,
    ...m.ineligible.filter((c) => !alternatives.includes(c)),
  ];
  const shortlisted = new Set(m.shortlist.map((c) => c.offering_id));
  const otherEligible = m.eligible.filter((c) => !shortlisted.has(c.offering_id));
  const stale = m.selection && m.selection.eligible === false ? m.selection : null;

  return (
    <div>
      <GlassSegmentedControl
        ariaLabel="Sourcing view"
        size="sm"
        value={view}
        onChange={setView}
        className="mb-5"
        segments={[
          { value: "shortlist", label: `Shortlist (${m.shortlist.length})`, icon: Trophy },
          {
            value: "alternatives",
            label: `Alternatives (${alternatives.length})`,
            icon: GitCompare,
          },
        ]}
      />
      {view === "shortlist" && (
        <>
          <h2 className="font-semibold">Shortlist — {subject.title}</h2>
          <p className="text-xs text-muted-foreground">
            {m.context.quantity.replace(/\.?0+$/, "")} {m.context.unit_of_measure}
            {m.context.budget_per_unit
              ? ` · budget ${m.context.budget_per_unit.replace(/\.?0+$/, "")} ${m.context.currency} / unit`
              : ` · ${m.context.budget_note ?? "no budget stated"}`}
            {m.context.deadline && ` · deliver by ${m.context.deadline}`}
          </p>
          {m.shortlist.length === 0 ? (
            <p className="surface mt-3 p-4 text-sm text-muted-foreground">
              No supplier offering passes every hard requirement.{" "}
              {m.needs_review.length > 0 && `${m.needs_review.length} need review (see below).`}
            </p>
          ) : (
            <div className="mt-3 grid gap-4 md:grid-cols-3">
              {m.shortlist.map((c) => (
                <CandidateCard
                  key={c.offering_id}
                  c={c}
                  recommended
                  selected={selected === c.offering_id}
                  disabled={busy}
                  onSelect={() => choose(c)}
                />
              ))}
            </div>
          )}
          {otherEligible.length > 0 && (
            <>
              <h3 className="mt-5 text-sm font-semibold">Other eligible alternatives</h3>
              <p className="text-xs text-muted-foreground">
                These also pass every hard requirement but are not in the recommended shortlist. You
                may select one instead.
              </p>
              <div className="mt-2 grid gap-4 md:grid-cols-3">
                {otherEligible.map((c) => (
                  <CandidateCard
                    key={c.offering_id}
                    c={c}
                    selected={selected === c.offering_id}
                    disabled={busy}
                    onSelect={() => choose(c)}
                  />
                ))}
              </div>
            </>
          )}
          {persisted && m.selection && (
            <p className="mt-3 text-xs text-muted-foreground">
              Saved selection:{" "}
              <span className="font-medium text-foreground">{m.selection.company_name}</span> (
              {m.selection.offering_id}). Selecting does not start a negotiation.{" "}
              <button className="underline" disabled={busy} onClick={clearChoice}>
                Clear selection
              </button>
            </p>
          )}
          {stale && (
            <p role="alert" className="mt-2 text-sm text-destructive">
              Your selected supplier {stale.company_name} ({stale.offering_id}) can no longer be
              negotiated: {stale.reason}. Select another supplier.
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {m.active_negotiation_id || m.overlapping_negotiation_id ? (
              <Button variant="outline" asChild>
                <Link to="/workspace/negotiations">View active negotiation</Link>
              </Button>
            ) : (
              <>
                <Button
                  disabled={!selected || !!stale || busy}
                  onClick={() => selected && start({ offering_id: selected })}
                >
                  Start Negotiation with Selected Supplier
                </Button>
                <Button
                  variant="outline"
                  disabled={!m.shortlist.length || busy}
                  onClick={() => start({ auto_select: true })}
                >
                  <Sparkles className="size-4" />
                  Let the agent choose
                </Button>
              </>
            )}
          </div>
          {m.overlapping_negotiation_id ? (
            <p className="mt-2 text-xs text-warning">
              Some of this demand is already being negotiated{" "}
              {subject.type === "demand_pool" ? "as an individual item" : "inside a pool"}. Finish
              or cancel that negotiation first, so the same items are not negotiated twice.
            </p>
          ) : (
            !m.active_negotiation_id && (
              <p className="mt-2 text-xs text-muted-foreground">
                Applies to {scope} only. No other items are negotiated.
              </p>
            )
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {error}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            Ranking:{" "}
            {m.ranking.factors_used.map((f) => `${f} ×${m.ranking.weights[f]}`).join(", ") ||
              "no comparable factors"}
            . {m.ranking.note}
          </p>
          {notSelectable.length > 0 && <NotSelectable items={notSelectable} />}
        </>
      )}
      {view === "alternatives" &&
        (alternatives.length === 0 ? (
          <p className="text-sm text-muted-foreground">No other materials in this category.</p>
        ) : (
          <div>
            <h2 className="font-semibold">Component alternatives</h2>
            <p className="text-sm text-muted-foreground">
              Different materials in the same category. They are not evaluated as substitutes;
              engineering qualification is required, so they cannot be selected or negotiated for
              this requirement.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {alternatives.map((o) => (
                <div key={o.offering_id} className="surface p-4 text-sm">
                  <div className="font-medium">{o.material_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.company_name} · {o.material_grade ?? "grade not listed"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

function CandidateCard({
  c,
  selected,
  onSelect,
  recommended = false,
  disabled = false,
}: {
  c: Candidate;
  selected: boolean;
  onSelect: () => void;
  recommended?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      disabled={disabled}
      className={`surface p-4 text-left outline-none transition duration-200 hover:-translate-y-0.5 hover:shadow-elegant active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70 ${selected ? "ring-2 ring-success" : ""}`}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill tone="primary">
          #{c.rank} · Score {c.score ?? "—"}
        </Pill>
        {recommended && c.rank === 1 && (
          <Pill tone="primary">
            <Sparkles className="size-3" />
            Agent recommended
          </Pill>
        )}
        {recommended && c.rank !== 1 && <Pill>Shortlisted</Pill>}
        {selected && (
          <Pill tone="success" className="ml-auto">
            <Check className="size-3" />
            Selected Supplier
          </Pill>
        )}
      </div>
      <div className="mt-3 font-semibold">{c.company_name}</div>
      <div className="text-xs text-muted-foreground">
        {c.material_name} · {c.country_of_origin ?? "origin not listed"}
        {c.data_source === "sample_csv" && " · sample data"}
      </div>
      <div className="mt-3 text-sm">
        {money(Number(c.unit_price), c.currency)} / {c.unit_of_measure ?? "unit"} ·{" "}
        {c.lead_time_days !== null ? `${c.lead_time_days} d` : "lead time not listed"}
      </div>
      <div className="mt-3">
        <CheckList
          checks={c.checks.filter(
            (x) =>
              x.status !== "pass" ||
              ["delivery_deadline", "minimum_order_quantity", "certifications"].includes(x.check),
          )}
        />
      </div>
    </button>
  );
}

function NotSelectable({ items }: { items: Candidate[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-6 border-t pt-4">
      <button
        className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronDown className={`size-4 transition ${open ? "rotate-180" : ""}`} />
        {items.length} offering{items.length > 1 ? "s" : ""} not eligible or needing review
      </button>
      {open && (
        <ul className="mt-3 space-y-2">
          {items.map((c) => (
            <li key={c.offering_id} className="surface p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-auto font-medium">
                  {c.company_name} · {c.material_name}
                </span>
                <Pill tone={c.status === "needs_review" ? "warning" : "danger"}>
                  {c.status === "needs_review" ? "Needs review" : "Not eligible"}
                </Pill>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Cannot currently be selected or negotiated
                {c.limitations.length ? `: ${c.limitations.slice(0, 3).join("; ")}` : "."}
              </p>
              <div className="mt-2">
                <CheckList checks={c.checks.filter((x) => x.mandatory)} onlyIssues />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
