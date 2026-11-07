import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Handshake, ChevronDown, Mail, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Pill, SimTag, money } from "@/components/bedro/ui";
import { Notices } from "@/components/bedro/checks";
import { ErrorNotice, LoadingNotice, describeApiError } from "@/components/bedro/query-notice";
import {
  STATUS_LABEL,
  advanceNegotiation,
  cancelNegotiation,
  invalidateNegotiations,
  negotiationQuery,
  type AgentDecision,
  type Offer,
  type SupplierIntent,
} from "@/services/negotiations";
import {
  REQUEST_STATUS,
  REQUIREMENT_STATUS,
  invalidateRequests,
  negotiateRequest,
  requestQuery,
  useRequests,
  type NegotiateResult,
  type RequestSummary,
  type RequirementRow,
  type SupplierNegotiationRow,
} from "@/services/procurement";
import { MESSAGE_STATUS, syncStatusQuery, toDate } from "@/services/email";
import { OutcomeEmailStatus } from "@/components/bedro/outcome-email";
import { actions } from "@/services/store";

export const Route = createFileRoute("/workspace/negotiations")({ component: Negotiations });

const SOURCE: Record<Offer["source"], string> = {
  policy: "Buyer agent (policy)",
  llm_assisted: "Buyer agent (LLM-assisted, policy-bounded)",
  simulated_supplier: "Simulated supplier",
  supplier_reply: "Supplier email reply",
  test_reply: "Test-inbox reply (not the supplier)",
};
/** Email facts are distinct: prepared ≠ accepted by provider ≠ delivered ≠ replied. */
const COMM: Record<string, string> = {
  not_sent: "Proposal recorded — not sent",
  awaiting_authorization: "Email prepared — awaiting authorization",
  sent: "Email accepted by provider (delivery not confirmed)",
  send_failed: "Email send failed",
  outcome_unknown: "Email outcome unknown — reconcile in Supplier Communications",
  bounced: "Email bounced",
  received: "Received by email",
};
const fmt = (s: string) =>
  toDate(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
const COUNT_LABEL: [keyof RequestSummary["counts"], string][] = [
  ["completed", "completed"],
  ["active", "active"],
  ["pending_review", "pending review"],
  ["unresolved", "unresolved"],
  ["not_started", "not started"],
];

function Negotiations() {
  const q = useRequests();
  return (
    <>
      <PageHeader
        title="Negotiations"
        description="One card per procurement request (uploaded requirements file). Expand a request to see its requirements, and a requirement to see its supplier negotiations. Every status comes from the backend."
      />
      {q.isPending ? (
        <LoadingNotice>Loading procurement requests…</LoadingNotice>
      ) : q.isError ? (
        <ErrorNotice
          title="Procurement requests unavailable."
          error={q.error}
          onRetry={() => q.refetch()}
        />
      ) : q.data.length === 0 ? (
        <Empty
          icon={<Handshake className="size-5" />}
          title="No procurement requests"
          body="Upload a requirements file to create a procurement request, then negotiate it here."
          action={
            <Button asChild>
              <Link to="/workspace/requirements">Upload requirements</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {q.data.map((r) => (
            <RequestCard key={r.id} r={r} />
          ))}
        </div>
      )}
    </>
  );
}

function RequestCard({ r }: { r: RequestSummary }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<NegotiateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const s = REQUEST_STATUS[r.status];
  const closed = r.status === "cancelled" || r.status === "completed" || r.status === "failed";

  async function negotiate(itemIds?: string[]) {
    setBusy(true);
    setError(null);
    try {
      const res = await negotiateRequest(r.id, itemIds);
      setResult(res);
      setOpen(true);
      const { started, active, skipped, failed } = res.summary;
      const text = `${started} started · ${active} already active · ${skipped} skipped · ${failed} failed`;
      (failed ? toast.warning : toast.success)(
        `${res.request_ref ?? "Request"}: agent negotiation processed`,
        {
          id: `negotiate-${r.id}`,
          description: text,
        },
      );
    } catch (e) {
      setError(describeApiError(e));
      toast.error("Negotiation could not be started", {
        id: `negotiate-${r.id}`,
        description: describeApiError(e),
      });
    }
    await Promise.all([
      invalidateRequests(qc),
      invalidateNegotiations(qc),
      qc.invalidateQueries({ queryKey: ["email-conversations"] }),
    ]);
    setBusy(false);
  }

  return (
    <section
      className="surface"
      aria-label={`Procurement request ${r.request_ref ?? r.original_filename}`}
    >
      <div className="flex flex-wrap items-center gap-3 p-5">
        <button
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronDown className={`size-4 shrink-0 transition ${open ? "rotate-180" : ""}`} />
          <div className="min-w-0">
            <div className="font-semibold">
              {r.request_ref ?? "Request"}{" "}
              <span className="font-normal text-muted-foreground">· {r.original_filename}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Uploaded {fmt(r.uploaded_at)} · {r.total_requirements} requirement
              {r.total_requirements === 1 ? "" : "s"}
              {COUNT_LABEL.filter(([k]) => r.counts[k])
                .map(([k, label]) => ` · ${r.counts[k]} ${label}`)
                .join("")}
            </div>
          </div>
        </button>
        <Pill tone={s.tone}>{s.label}</Pill>
        {!closed && (
          <Button size="sm" disabled={busy} onClick={() => negotiate()}>
            <Bot className="size-3.5" />
            {busy ? "Negotiating…" : "Negotiate Using Agent"}
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="px-5 pb-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {result && <ResultSummary res={result} onDismiss={() => setResult(null)} />}
      {open && (
        <RequestBody id={r.id} busy={busy} onNegotiateItem={(itemId) => negotiate([itemId])} />
      )}
    </section>
  );
}

function ResultSummary({ res, onDismiss }: { res: NegotiateResult; onDismiss: () => void }) {
  const notable = res.results; // every processed requirement, with the supplier used and why
  return (
    <div role="status" className="mx-5 mb-3 rounded-xl bg-accent/60 p-3 text-xs">
      <div className="flex items-start gap-2">
        <p className="flex-1 font-medium">
          Agent processed {res.processed} requirement{res.processed === 1 ? "" : "s"}:{" "}
          {res.summary.started} started, {res.summary.active} already active, {res.summary.skipped}{" "}
          skipped, {res.summary.failed} failed.
        </p>
        <button className="text-muted-foreground hover:text-foreground" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
      {notable.length > 0 && (
        <ul className="mt-2 space-y-1">
          {notable.map((x) => (
            <li
              key={x.item_id}
              className={x.outcome === "failed" ? "text-destructive" : "text-muted-foreground"}
            >
              <span className="font-medium">{x.requirement_id ?? x.item_name}</span> — {x.outcome}
              {x.supplier_id &&
                ` · ${x.supplier_id}${x.offering_id ? ` / ${x.offering_id}` : ""} (${x.selection_source === "saved_selection" ? "your selection" : "agent selection"})`}
              : {x.reason}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RequestBody({
  id,
  busy,
  onNegotiateItem,
}: {
  id: string;
  busy: boolean;
  onNegotiateItem: (itemId: string) => void;
}) {
  const q = useQuery(requestQuery(id));
  if (q.isPending)
    return (
      <div className="border-t p-5">
        <LoadingNotice>Loading requirements…</LoadingNotice>
      </div>
    );
  if (q.isError)
    return (
      <div className="border-t p-5">
        <ErrorNotice title="Request unavailable." error={q.error} onRetry={() => q.refetch()} />
      </div>
    );
  if (q.data.requirements.length === 0)
    return (
      <p className="border-t p-5 text-sm text-muted-foreground">
        This request has no valid requirements.
      </p>
    );
  return (
    <ul className="divide-y border-t" aria-label="Requirements">
      {q.data.requirements.map((req) => (
        <li key={req.id}>
          <Requirement req={req} busy={busy} onNegotiate={() => onNegotiateItem(req.id)} />
        </li>
      ))}
    </ul>
  );
}

function Requirement({
  req,
  busy,
  onNegotiate,
}: {
  req: RequirementRow;
  busy: boolean;
  onNegotiate: () => void;
}) {
  const [open, setOpen] = useState(false);
  const s = REQUIREMENT_STATUS[req.status];
  return (
    <div className="px-5 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronDown className={`size-3.5 shrink-0 transition ${open ? "rotate-180" : ""}`} />
          <span className="min-w-0">
            <span className="font-medium">
              {req.requirement_id ?? `Row ${req.row_number}`} · {req.item_name}
            </span>
            <span className="block text-xs text-muted-foreground">
              {req.quantity.toLocaleString()} {req.unit}
              {req.budget_per_unit !== null &&
                ` · budget ${money(req.budget_per_unit, req.currency ?? "USD")} / unit`}
              {` · ${req.negotiation_count} supplier negotiation${req.negotiation_count === 1 ? "" : "s"}`}
              {req.selection
                ? ` · selected supplier: ${req.selection.company_name} (${req.selection.supplier_id})`
                : req.status === "not_started" && " · no saved selection — agent will choose"}
            </span>
          </span>
        </button>
        <Pill tone={s.tone}>{s.label}</Pill>
        {req.status === "not_started" && (
          <Button size="sm" variant="outline" disabled={busy} onClick={onNegotiate}>
            Negotiate this requirement
          </Button>
        )}
      </div>
      {open && (
        <div className="mt-3 space-y-2 pl-5">
          {req.negotiations.length === 0 ? (
            <p className="text-xs text-muted-foreground">No supplier negotiations yet.</p>
          ) : (
            req.negotiations.map((n) => <SupplierNegotiation key={n.negotiation_id} n={n} />)
          )}
        </div>
      )}
    </div>
  );
}

function latestResponse(n: SupplierNegotiationRow) {
  const r = n.latest_response;
  if (!r) return "No supplier response yet";
  if (r.action) {
    const price = r.unit_price !== null ? ` ${money(r.unit_price, r.currency ?? n.currency)}` : "";
    return `${r.simulated ? "Simulated/test: " : ""}${r.action}${price} (round ${r.round})`;
  }
  return r.email_status
    ? `Reply ${MESSAGE_STATUS[r.email_status]?.label.toLowerCase() ?? r.email_status}`
    : "—";
}

function SupplierNegotiation({ n }: { n: SupplierNegotiationRow }) {
  const qc = useQueryClient();
  const [details, setDetails] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const s = STATUS_LABEL[n.status];
  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      await cancelNegotiation(n.negotiation_id);
      toast.success(`Negotiation with ${n.supplier_name} cancelled`, {
        id: `cancel-${n.negotiation_id}`,
        description: "Other suppliers and requirements are unaffected.",
      });
    } catch (e) {
      setError(describeApiError(e));
    }
    await Promise.all([
      invalidateNegotiations(qc),
      qc.invalidateQueries({ queryKey: ["email-conversations"] }),
    ]);
    setBusy(false);
  }
  return (
    <div
      className="rounded-xl border p-3 text-sm"
      aria-label={`Negotiation with ${n.supplier_name}`}
    >
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="font-medium">
            {n.supplier_name}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              · Supplier {n.supplier_id}
              {n.pooled && " · pooled demand"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {n.registered_email ?? "No registered email"}
            {n.email_problem && <span className="text-destructive"> — {n.email_problem}</span>}
          </div>
        </div>
        {n.mode === "simulated" && <SimTag />}
        <Pill tone={s.tone}>{s.label}</Pill>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs md:grid-cols-4">
        <div>
          <dt className="text-muted-foreground">Current price</dt>
          <dd>{n.current_price !== null ? `${money(n.current_price, n.currency)} / unit` : "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Round</dt>
          <dd>
            {n.current_round}/{n.max_rounds}
          </dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Latest response</dt>
          <dd>{latestResponse(n)}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Last activity</dt>
          <dd>{fmt(n.last_activity)}</dd>
        </div>
      </dl>
      {n.reference && (
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">{n.reference}</p>
      )}
      {n.send_problem && (
        <p role="alert" className="mt-1 text-xs text-destructive">
          Not emailed: {n.send_problem}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => actions.openComms(n.negotiation_id)}>
          <Mail className="size-3.5" />
          Open conversation
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-expanded={details}
          onClick={() => setDetails((v) => !v)}
        >
          {details ? "Hide rounds" : "Rounds & offers"}
        </Button>
        {n.awaiting_buyer_decision && (
          <Button size="sm" variant="outline" asChild>
            <Link to="/workspace/decision">Review final offer</Link>
          </Button>
        )}
        {n.can_cancel && (
          <Button size="sm" variant="ghost" disabled={busy} onClick={cancel}>
            Cancel this supplier negotiation
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="mt-1 text-sm text-destructive">
          {error} Reload and try again.
        </p>
      )}
      {details && <Detail id={n.negotiation_id} />}
    </div>
  );
}

const DECISION: Record<AgentDecision["action"], string> = {
  counteroffer: "Agent sent a counteroffer",
  accept_pending_buyer_approval: "Agreement reached — awaiting your approval",
  request_clarification: "Supplier asked a question — your reply is needed",
  escalate_to_buyer: "Needs your review — nothing was sent automatically",
  stop: "Agent stopped negotiating",
};

/** The agent's latest persisted decision: outcome and its business reason (no internal reasoning). */
function LatestDecision({ d }: { d: AgentDecision }) {
  return (
    <div className="rounded-xl border p-3" aria-label="Latest agent decision">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{DECISION[d.action]}</span>
        {d.requires_buyer_approval && <Pill tone="warning">Buyer action needed</Pill>}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{d.reason}</p>
      {d.action === "stop" && d.alternatives.length > 0 && (
        <p className="mt-1 text-xs">
          Eligible alternatives:{" "}
          {d.alternatives
            .map((a) => `${a.company_name} (${a.offering_id}, listed ${a.unit_price} ${a.currency})`)
            .join("; ")}
        </p>
      )}
    </div>
  );
}

const INTENT: Record<string, string> = {
  ACCEPT_OFFER: "Accepted the offer",
  COUNTEROFFER: "Counteroffer",
  REJECT_OFFER: "Declined",
  REQUEST_CLARIFICATION: "Asked a question",
  CONDITIONAL_ACCEPTANCE: "Conditional acceptance",
  REQUEST_ADVANCE_PAYMENT: "Requests advance payment",
  REQUEST_CHANGED_QUANTITY: "Changed quantity",
  REQUEST_CHANGED_LEAD_TIME: "Changed lead time",
  SHIPPING_OR_FREIGHT_CHANGE: "Shipping/freight terms",
  WARRANTY_OR_QUALITY_CONDITION: "Warranty/quality condition",
  REQUEST_EXTENSION: "Asked for more time",
  OUT_OF_OFFICE_OR_AUTOMATED_REPLY: "Automatic / out-of-office reply",
  IRRELEVANT_MESSAGE: "Unrelated message",
  AMBIGUOUS_OR_UNKNOWN: "Unclear reply",
};

/** What the supplier's latest reply was understood to say. Tone is shown but never drives a commercial decision. */
function SupplierIntentLine({ i, currency }: { i: SupplierIntent; currency: string }) {
  const terms = [
    i.unit_price && `${i.unit_price} ${i.currency ?? currency}/unit`,
    i.quantity && `qty ${i.quantity}`,
    i.lead_time_days !== null && `${i.lead_time_days} d`,
    i.payment_terms && `payment ${i.payment_terms}`,
    i.warranty,
    i.landed_cost_complete === false && i.unit_price && "landed cost incomplete",
  ].filter(Boolean);
  return (
    <div className="rounded-xl border p-3 text-xs" aria-label="Latest supplier reply">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="font-medium">Supplier: {INTENT[i.intent] ?? i.intent}</span>
        {i.confidence !== null && <span className="text-muted-foreground">confidence {Math.round(i.confidence * 100)}%</span>}
        {i.sentiment && i.sentiment !== "neutral" && <Pill tone="neutral">tone: {i.sentiment}</Pill>}
      </div>
      {terms.length > 0 && <p className="mt-1">{terms.join(" · ")}</p>}
      {i.review_reason && <p className="mt-1 text-warning">Needs review: {i.review_reason}</p>}
    </div>
  );
}

function Detail({ id }: { id: string }) {
  const qc = useQueryClient();
  const q = useQuery(negotiationQuery(id));
  const sync = useQuery(syncStatusQuery);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(describeApiError(e));
    }
    await invalidateNegotiations(qc);
    setBusy(false);
  }
  if (q.isPending)
    return (
      <div className="mt-3">
        <LoadingNotice>Loading negotiation…</LoadingNotice>
      </div>
    );
  if (q.isError)
    return (
      <div className="mt-3">
        <ErrorNotice title="Negotiation unavailable." error={q.error} onRetry={() => q.refetch()} />
      </div>
    );
  const n = q.data;
  const pollEvery = sync.data?.polling_interval_seconds ?? 0;
  const rounds = [...new Set(n.offers.map((o) => o.round_number))];
  return (
    <div className="mt-3 space-y-4 border-t pt-3 text-sm">
      <Notices notices={n.notices} />
      <p className="text-xs text-muted-foreground">
        {n.selection_reason} · List {money(n.list_unit_price, n.currency)} · target{" "}
        {money(n.target_unit_price, n.currency)} · ceiling {money(n.ceiling_unit_price, n.currency)}{" "}
        (budget {money(n.budget_per_unit, n.currency)})
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Round", "From", "Action", "Unit price", "Lead time", "Total", "Verification"].map(
                (h) => (
                  <th key={h} className="px-3 py-2 font-semibold">
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y">
            {rounds
              .flatMap((r) => n.offers.filter((o) => o.round_number === r))
              .map((o) => (
                <tr key={o.id} className="align-top">
                  <td className="px-3 py-2 text-muted-foreground">{o.round_number}</td>
                  <td className="px-3 py-2">
                    {SOURCE[o.source]}
                    {o.simulated && (
                      <Pill tone="warning" className="ml-1">
                        Simulated
                      </Pill>
                    )}
                    <div className="mt-1 text-xs text-muted-foreground">{o.rationale}</div>
                    {COMM[o.communication_status] && (
                      <div className="text-xs text-muted-foreground">
                        {COMM[o.communication_status]}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2 capitalize">{o.action}</td>
                  <td className="px-3 py-2">
                    {o.unit_price !== null ? money(o.unit_price, o.currency ?? n.currency) : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {o.lead_time_days !== null ? `${o.lead_time_days} d` : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {o.quoted_total !== null
                      ? money(o.quoted_total, o.currency ?? n.currency)
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    {o.verification ? (
                      <Pill
                        tone={
                          o.verification.status === "verified"
                            ? "success"
                            : o.verification.status === "rejected"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {o.verification.status.replace("_", " ")}
                      </Pill>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {n.recommendation && (
        <p className="rounded-xl bg-accent p-3 text-accent-foreground">{n.recommendation}</p>
      )}
      {n.latest_decision && <LatestDecision d={n.latest_decision} />}
      {n.latest_intent && <SupplierIntentLine i={n.latest_intent} currency={n.currency} />}
      <OutcomeEmailStatus n={n} />
      {n.status === "awaiting_supplier_response" && n.mode !== "simulated" && (
        <p className="text-xs text-muted-foreground">
          Waiting for the supplier's real reply
          {!n.mode.startsWith("email")
            ? " (no email channel is configured)"
            : pollEvery > 0
              ? ` — the inbox is checked every ${pollEvery}s and the agent answers valid replies automatically`
              : " — automatic reply processing needs inbox polling (APP_EMAIL_POLL_INTERVAL_SECONDS > 0); until then use “Check inbox” in Supplier Communications, which also runs the agent's response"}
          ; nothing is simulated.
        </p>
      )}
      {n.allowed_actions.includes("advance") && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() => run(() => advanceNegotiation(n.id, n.current_round))}
        >
          {busy ? "Running…" : "Run next round (simulated)"}
        </Button>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error} Reload and try again.
        </p>
      )}
    </div>
  );
}
