import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Layers, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Pill, Stat } from "@/components/bedro/ui";
import { ErrorNotice, LoadingNotice, describeApiError } from "@/components/bedro/query-notice";
import { decidePool, invalidatePooling, recalculatePools, useAssessments, usePools, type ItemAssessment, type Pool, type PoolApproval } from "@/services/pooling";
import { invalidateRequests } from "@/services/procurement";

export const Route = createFileRoute("/workspace/pooling")({ component: Pooling });

const OUTCOME: Record<ItemAssessment["outcome"], { label: string; tone: "warning" | "neutral" | "danger" | "success" }> = {
  needs_clarification: { label: "Needs clarification", tone: "warning" },
  incompatible: { label: "Not compatible", tone: "danger" },
  no_match: { label: "No matching demand", tone: "neutral" },
  pooled: { label: "Pooled", tone: "success" },
  excluded: { label: "Excluded", tone: "neutral" },
};
const APPROVAL: Record<PoolApproval, { label: string; tone: "warning" | "success" | "neutral" }> = {
  pending: { label: "Awaiting your approval", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected — sourced individually", tone: "neutral" },
};
const approvalOf = (p: Pool): PoolApproval => p.approval_status ?? "pending";
const ORDER: ItemAssessment["outcome"][] = ["needs_clarification", "incompatible", "no_match"];
const qty = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 4 });
const day = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString();
/** Quantities are only ever added within one unit of measure (the backend never converts units). */
const byUnit = (rows: { unit: string; n: number }[]) => {
  const m = new Map<string, number>();
  for (const r of rows) m.set(r.unit, (m.get(r.unit) ?? 0) + r.n);
  return [...m].map(([u, n]) => `${qty(n)} ${u}`).join(" · ") || "—";
};

function Pooling() {
  const qc = useQueryClient();
  const pools = usePools();
  const assessments = useAssessments();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function recalc() {
    setBusy(true); setError(null);
    try { await recalculatePools(); await invalidatePooling(qc); }
    catch (e) { setError(describeApiError(e)); }
    finally { setBusy(false); }
  }

  const notPooled = (assessments.data ?? []).filter((a) => ORDER.includes(a.outcome)).sort((a, b) => ORDER.indexOf(a.outcome) - ORDER.indexOf(b.outcome));
  const loading = pools.isPending || assessments.isPending;
  const open = (assessments.data ?? []).filter((a) => a.outcome !== "excluded");
  const count = (o: ItemAssessment["outcome"]) => open.filter((a) => a.outcome === o).length;
  // pools waiting for a buyer decision first: nothing in them is negotiated or emailed until then
  const poolList = [...(pools.data ?? [])].sort((a, b) => Number(approvalOf(b) === "pending") - Number(approvalOf(a) === "pending"));
  const pending = poolList.filter((p) => approvalOf(p) === "pending").length;
  const failed = pools.isError ? pools : assessments.isError ? assessments : null;

  return (
    <>
      <PageHeader title="Demand Pooling" description="Requirement items that are genuinely compatible — same component, specification, unit, grade and delivery country, with close delivery deadlines. Original items are never merged or changed. Approve a pool to negotiate its combined demand with one supplier, or reject it to source its items individually — nothing pooled is sent to a supplier until you decide."
        actions={<Button variant="outline" size="sm" disabled={busy} onClick={recalc}><RefreshCw className={`size-4 ${busy ? "animate-spin" : ""}`} />{busy ? "Recalculating…" : "Recalculate"}</Button>} />
      {error && <div className="mb-4"><ErrorNotice title="Recalculation failed." error={new Error(error)} /></div>}
      {loading ? <LoadingNotice>Loading demand pools…</LoadingNotice>
      : failed ? <ErrorNotice title="Demand pools unavailable." error={failed.error} onRetry={() => { pools.refetch(); assessments.refetch(); }} />
      : open.length === 0 ? (
        <Empty icon={<Layers className="size-5" />} title="No requirements to pool" body="Upload requirement files; every valid item is checked for compatible demand automatically." />
      ) : <>
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Sourcing opportunities" value={poolList.length} hint={pending ? `${pending} awaiting your approval` : "Confirmed pools containing your demand"} />
          <Stat label="Pooled requirements" value={count("pooled")} hint={`of ${open.length} active requirements`} />
          <Stat label="Combined pooled demand" value={<span className="text-xl">{byUnit(poolList.map((p) => ({ unit: p.unit_of_measure, n: p.aggregate_quantity })))}</span>}
            hint={`Your share: ${byUnit(poolList.map((p) => ({ unit: p.unit_of_measure, n: p.own_quantity ?? 0 })))}`} />
          <Stat label="Awaiting clarification" value={count("needs_clarification")} hint={`${count("incompatible")} not compatible · ${count("no_match")} no matching demand`} />
        </div>
        {pending > 0 && (
          <div role="status" className="surface mb-4 border-warning/40 p-4 text-sm">
            <span className="font-medium">{pending} {pending === 1 ? "pool needs" : "pools need"} your decision.</span>{" "}
            <span className="text-muted-foreground">Their requirements are held back from supplier negotiation (and no email is sent) until you approve or reject.</span>
          </div>
        )}
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Confirmed pools ({poolList.length})</h2>
        {poolList.length === 0 ? <p className="surface p-5 text-sm text-muted-foreground">No compatible demand found yet. See below for why items were not pooled.</p> : (
          <div className="grid gap-4 md:grid-cols-2">{poolList.map((p) => <PoolCard key={p.id} pool={p} />)}</div>
        )}
        {notPooled.length > 0 && <>
          <h2 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Not pooled ({notPooled.length})</h2>
          <ul className="space-y-2">
            {notPooled.map((a) => (
              <li key={a.item_id} className="surface p-4 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="mr-auto font-medium">{a.material_name}</span>
                  <Pill tone={OUTCOME[a.outcome].tone}>{OUTCOME[a.outcome].label}</Pill>
                </div>
                <div className="text-xs text-muted-foreground">{a.component_category} · {qty(a.required_quantity)} {a.unit_of_measure} · {a.batch_filename} row {a.row_number}{a.source_requirement_id && ` · ${a.source_requirement_id}`}</div>
                <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs">{a.reasons.map((r) => <li key={r}>{r}</li>)}</ul>
              </li>
            ))}
          </ul>
        </>}
      </>}
    </>
  );
}

function PoolCard({ pool: p }: { pool: Pool }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = p.members.filter((m) => m.active);
  const c = p.constraints;
  const approval = approvalOf(p);

  async function decide(d: "approve" | "reject") {
    setBusy(true); setError(null);
    try { await decidePool(p.id, d); } catch (e) { setError(describeApiError(e)); }
    await Promise.all([invalidatePooling(qc), invalidateRequests(qc)]); // only the backend's confirmed state is shown
    setBusy(false);
  }

  return (
    <section className="surface p-5" aria-label={`Pool ${p.material_name}`}>
      <div className="flex items-start justify-between gap-2">
        <div><h3 className="font-semibold">{p.material_name}</h3><p className="text-sm text-muted-foreground">{p.component_category}</p></div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5"><Pill tone={APPROVAL[approval].tone}>{APPROVAL[approval].label}</Pill><Pill tone="primary">{p.member_count} items</Pill></div>
      </div>
      <div className="mt-4 font-display text-2xl font-semibold">{qty(p.aggregate_quantity)} <span className="text-sm text-muted-foreground">{p.unit_of_measure} combined</span></div>
      <p className="mt-1 text-xs text-muted-foreground">Pool {p.id.slice(0, 8)} · deliver by {day(p.earliest_deadline)}{p.own_member_count !== undefined && ` · your share ${qty(p.own_quantity ?? 0)} ${p.unit_of_measure} (${p.own_member_count} of ${p.member_count} items)`}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        Combined requirements: {c.minimum_quality_rating !== null ? `quality ≥ ${c.minimum_quality_rating}` : "no quality minimum"}
        {c.required_certifications.length > 0 && ` · ${c.required_certifications.join(", ")}`}
        {c.compliance_requirements.length > 0 && ` · ${c.compliance_requirements.join(", ")}`}
        {` · substitutes ${c.substitution_allowed === null ? "not specified by all" : c.substitution_allowed ? "allowed" : "not allowed"}`}
      </p>
      <ul className="mt-3 space-y-1 border-t pt-3 text-sm">
        {active.map((m, i) => (
          <li key={m.item_id ?? `other-${i}`} className="flex justify-between gap-2">
            {/* other companies' members arrive anonymised from the backend (no ids, file, row or buyer) */}
            <span className="truncate text-muted-foreground">{m.own === false ? m.batch_filename : <>{m.batch_filename} · row {m.row_number}{m.source_requirement_id && ` · ${m.source_requirement_id}`}</>}</span>
            <span className="shrink-0">{qty(m.allocated_quantity)} {m.unit_of_measure}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
        {approval !== "approved" && <Button size="sm" disabled={busy} onClick={() => decide("approve")}><Check className="size-4" />{approval === "pending" ? "Approve pooling" : "Approve instead"}</Button>}
        {approval !== "rejected" && <Button size="sm" variant="outline" disabled={busy} onClick={() => decide("reject")}><X className="size-4" />{approval === "pending" ? "Reject — source individually" : "Reject instead"}</Button>}
        <span className="text-xs text-muted-foreground">
          {approval === "approved" ? "Negotiate using agent will negotiate this combined demand with one supplier."
            : approval === "rejected" ? "Each requirement is negotiated on its own."
            : "Held back from negotiation until you decide."}
          {p.approval_decided_at && ` Decided ${new Date(p.approval_decided_at).toLocaleString()}.`}
        </span>
      </div>
      {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
    </section>
  );
}
