import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Pill, SimTag, money } from "@/components/bedro/ui";
import { CheckList, Notices } from "@/components/bedro/checks";
import { ErrorNotice, LoadingNotice, describeApiError } from "@/components/bedro/query-notice";
import { OutcomeEmailStatus } from "@/components/bedro/outcome-email";
import { STATUS_LABEL, decideNegotiation, invalidateNegotiations, negotiationQuery, useNegotiations } from "@/services/negotiations";

export const Route = createFileRoute("/workspace/decision")({ component: Decision });

// Offers that reached the buyer (agreed, under review, or already decided) — derived from persisted statuses.
const DECIDABLE = ["awaiting_buyer_decision", "manual_review_required", "accepted_by_buyer", "rejected_by_buyer", "verification_failed"];

function Decision() {
  const q = useNegotiations();
  const list = (q.data ?? []).filter((n) => DECIDABLE.includes(n.status));
  return (
    <>
      <PageHeader title="Sourcing Decision" description="Review the verified final offer and explicitly accept or decline it. A recommendation is never a purchase; accepting records your decision only." />
      {q.isPending ? <LoadingNotice>Loading offers…</LoadingNotice>
      : q.isError ? <ErrorNotice title="Offers unavailable." error={q.error} onRetry={() => q.refetch()} />
      : list.length === 0 ? <Empty icon={<CheckCircle2 className="size-5" />} title="No offers awaiting decision" body="Verified final offers from completed negotiations appear here for your decision." />
      : <div className="space-y-4">{list.map((n) => <FinalOffer key={n.id} id={n.id} />)}</div>}
    </>
  );
}

function FinalOffer({ id }: { id: string }) {
  const qc = useQueryClient();
  const q = useQuery(negotiationQuery(id));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (q.isPending) return <div className="surface p-6"><LoadingNotice>Loading offer…</LoadingNotice></div>;
  if (q.isError) return <ErrorNotice title="Offer unavailable." error={q.error} onRetry={() => q.refetch()} />;
  const n = q.data;
  const o = n.offers.find((x) => x.id === n.final_offer_id);
  const s = STATUS_LABEL[n.status];

  async function decide(d: "accept" | "reject") {
    setBusy(true); setError(null);
    try { await decideNegotiation(n.id, d); } catch (e) { setError(describeApiError(e)); }
    await invalidateNegotiations(qc); // only the backend's confirmed state is shown
    setBusy(false);
  }

  return (
    <section className="surface p-6" aria-label={`Final offer from ${n.company_name}`}>
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="mr-auto text-lg font-semibold">{n.company_name}</h3>{n.simulated && <SimTag />}<Pill tone={s.tone}>{s.label}</Pill>
      </div>
      <p className="text-sm text-muted-foreground">{n.material_name} · {n.subject_type === "demand_pool" ? `pooled demand (${n.context.allocations.length} items)` : "single requirement"}</p>
      {o && (
        <dl className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[["Unit price", o.unit_price !== null ? money(o.unit_price, o.currency ?? n.currency) : "—"], ["Quantity", `${(o.quantity ?? 0).toLocaleString()} ${o.unit_of_measure ?? ""}`],
            ["Lead time", o.lead_time_days !== null ? `${o.lead_time_days} days` : "Not stated"], ["Total (goods only)", o.verification?.computed_total != null ? money(o.verification.computed_total, n.currency) : "—"]].map(([k, v]) => (
            <div key={k}><dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt><dd className="mt-1 font-display text-xl font-semibold">{v}</dd></div>
          ))}
        </dl>
      )}
      {n.recommendation && <p className="mt-4 rounded-xl bg-accent p-3 text-sm text-accent-foreground">{n.recommendation}</p>}
      {o?.verification && <div className="mt-4"><h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Independent verification — {o.verification.status.replace("_", " ")}</h4><CheckList checks={o.verification.checks} /></div>}
      {n.subject_type === "demand_pool" && (
        <ul className="mt-4 space-y-1 text-xs text-muted-foreground">{n.context.allocations.map((a) => <li key={a.item_id}>{a.batch_filename} · row {a.row_number}{a.source_requirement_id && ` · ${a.source_requirement_id}`}: {Number(a.quantity).toLocaleString()} {a.unit_of_measure}</li>)}</ul>
      )}
      <div className="mt-4"><Notices notices={n.notices} /></div>
      {(n.allowed_actions.includes("accept") || n.allowed_actions.includes("reject")) && (
        <div className="mt-6 flex gap-3">
          {n.allowed_actions.includes("accept") && <Button disabled={busy} onClick={() => decide("accept")}>Accept Offer</Button>}
          {n.allowed_actions.includes("reject") && <Button variant="outline" disabled={busy} onClick={() => decide("reject")}>Decline Offer</Button>}
        </div>
      )}
      {n.decision && <p className="mt-4 text-sm">Your decision: <Pill tone={n.decision.decision === "accepted" ? "success" : "neutral"}>{n.decision.decision}</Pill></p>}
      <div className="mt-2"><OutcomeEmailStatus n={n} /></div>
      {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
    </section>
  );
}
