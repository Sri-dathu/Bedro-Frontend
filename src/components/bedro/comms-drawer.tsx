import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Inbox,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/bedro/ui";
import { ErrorNotice, LoadingNotice, describeApiError } from "@/components/bedro/query-notice";
import {
  STATUS_LABEL,
  negotiationQuery,
  type NegotiationStatus,
  type Offer,
} from "@/services/negotiations";
import { actions } from "@/services/store";
import {
  MESSAGE_STATUS,
  activitySignature,
  communicationsQuery,
  conversationsQuery,
  invalidateEmail,
  messageTime,
  notifyMessageOutcome,
  notifySyncResult,
  prepareEmail,
  reconcileMessage,
  sendMessage,
  syncInbox,
  syncStatusQuery,
  toDate,
  unmatchedQuery,
  useEmailStatus,
  type Conversation,
  type EmailMessage,
  type EmailStatus,
} from "@/services/email";

const CHANNEL = {
  none: { label: "Email: not configured", tone: "danger" },
  disabled: { label: "Email: supplier sending disabled", tone: "danger" },
  test: { label: "Email: TEST MODE", tone: "warning" },
  production: { label: "Email: live", tone: "success" },
} as const;
const DONE = ["accepted_by_provider", "reply_received", "bounced"];
const fmt = (d: Date) => d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

/** Supplier Communications: one conversation per supplier negotiation (supplier ID + negotiation context), with the
 * full chronological thread. Only messages the backend linked to our proposals appear; bodies are plain text. */
export function CommsDrawer({
  open,
  onClose,
  initialNegotiationId = null,
}: {
  open: boolean;
  onClose: () => void;
  /** open directly on this negotiation's conversation (e.g. from the Negotiations page) */
  initialNegotiationId?: string | null;
}) {
  const qc = useQueryClient();
  const status = useEmailStatus();
  const convs = useQuery({
    ...conversationsQuery,
    enabled: open,
    refetchInterval: open ? 30_000 : false,
  });
  const [selected, setSelected] = useState<string | null>(initialNegotiationId);
  useEffect(() => {
    if (open && initialNegotiationId) setSelected(initialNegotiationId);
  }, [open, initialNegotiationId]);
  const [syncing, setSyncing] = useState(false);
  const ch = status.data?.channel;
  const list = convs.data?.conversations ?? [];
  const unmatched = convs.data?.unmatched_count ?? 0;
  const current = list.find((c) => c.negotiation_id === selected) ?? null;
  const view = selected === "unmatched" ? "unmatched" : current ? "conversation" : "none";
  // Everything shown while the drawer is open counts as seen: the header badge clears until new activity arrives.
  useEffect(() => {
    if (!open || !convs.data) return;
    actions.markSeen({
      ...Object.fromEntries(convs.data.conversations.map((c) => [c.negotiation_id, activitySignature(c)])),
      unmatched: String(convs.data.unmatched_count),
    });
  }, [open, convs.data]);

  async function sync() {
    setSyncing(true);
    try {
      notifySyncResult(await syncInbox());
    } catch (e) {
      toast.error("Inbox check failed", { id: "email-sync", description: describeApiError(e) });
    }
    await invalidateEmail(qc);
    setSyncing(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-foreground/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-label="Supplier Communications"
            className="glass fixed right-0 top-0 z-50 flex h-full w-full max-w-5xl flex-col p-4 md:p-6"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">Supplier Communications</h2>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-lg p-2 hover:bg-secondary"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {status.isPending ? (
                <Pill>Email: checking…</Pill>
              ) : status.isError ? (
                <Pill tone="danger">Email: backend unreachable</Pill>
              ) : (
                <Pill tone={CHANNEL[ch!].tone}>{CHANNEL[ch!].label}</Pill>
              )}
              {(ch === "test" || ch === "production") && (
                <Button size="sm" variant="outline" disabled={syncing} onClick={sync}>
                  <RefreshCw className={`size-3.5 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Checking inbox…" : "Check inbox"}
                </Button>
              )}
            </div>
            {status.data && <ChannelNote s={status.data} />}
            {(ch === "test" || ch === "production") && <SyncLine open={open} syncing={syncing} />}

            <div className="mt-4 grid min-h-0 flex-1 gap-4 md:grid-cols-[300px_1fr]">
              <nav
                aria-label="Supplier conversations"
                className={`min-h-0 overflow-y-auto pr-1 ${view === "none" ? "" : "hidden md:block"}`}
              >
                {convs.isPending ? (
                  <LoadingNotice>Loading conversations…</LoadingNotice>
                ) : convs.isError ? (
                  <ErrorNotice title="Conversations unavailable." error={convs.error} />
                ) : (
                  <>
                    {unmatched > 0 && (
                      <button
                        onClick={() => setSelected("unmatched")}
                        className={`mb-2 flex w-full items-center gap-2 rounded-xl p-3 text-left text-xs font-medium text-warning transition ${selected === "unmatched" ? "bg-warning/15" : "bg-warning/10 hover:bg-warning/15"}`}
                      >
                        <AlertTriangle className="size-4 shrink-0" />
                        {unmatched} repl{unmatched === 1 ? "y" : "ies"} could not be matched to one
                        negotiation
                      </button>
                    )}
                    {list.length === 0 ? (
                      <p className="surface p-4 text-sm text-muted-foreground">
                        No supplier conversations yet. A conversation appears when a negotiation
                        runs over email.
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {list.map((c) => (
                          <li key={c.negotiation_id}>
                            <ConversationItem
                              c={c}
                              active={c.negotiation_id === selected}
                              onOpen={() => setSelected(c.negotiation_id)}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </nav>
              <section className={`min-h-0 ${view === "none" ? "hidden md:block" : ""}`}>
                {view === "conversation" ? (
                  <ConversationView
                    key={current!.negotiation_id}
                    c={current!}
                    email={status.data}
                    onBack={() => setSelected(null)}
                    onClose={onClose}
                  />
                ) : view === "unmatched" ? (
                  <UnmatchedView onBack={() => setSelected(null)} />
                ) : (
                  <div className="surface grid h-full place-items-center p-6 text-center text-sm text-muted-foreground">
                    <div>
                      <Inbox className="mx-auto mb-2 size-6" />
                      Select a supplier conversation to see the full thread.
                    </div>
                  </div>
                )}
              </section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function ChannelNote({ s }: { s: EmailStatus }) {
  return (
    <p className="mt-2 text-xs text-muted-foreground">
      {s.message}
      {s.channel !== "none" &&
        ` Sending is authorised by: ${s.send_authorization === "agent" ? "the negotiation agent (automatic, after all checks)" : "you, per message"}.`}
      {s.provider_status?.problem && (
        <span role="alert" className="mt-1 block font-medium text-destructive">
          {s.provider_status.problem}
        </span>
      )}
    </p>
  );
}

const VERB: Record<string, string> = {
  offer: "offered",
  counteroffer: "countered",
  accept: "accepted",
  reject: "rejected",
};
const EMAILED: Record<string, string> = {
  sent: "emailed",
  awaiting_authorization: "email awaiting your Send",
  send_failed: "email failed",
  outcome_unknown: "email outcome unknown",
  bounced: "email bounced",
  not_sent: "not emailed",
};
const NEXT: Partial<Record<NegotiationStatus, string>> = {
  awaiting_supplier_response:
    "Next: waiting for the supplier's reply — the agent answers valid replies when the inbox is checked.",
  awaiting_buyer_decision:
    "Next: the final offer passed verification — your decision is needed in Sourcing Decision.",
  manual_review_required: "Next: manual review is required; the offer cannot be accepted as is.",
};

function offerLine(o: Offer, currency: string) {
  const who =
    o.party === "buyer"
      ? o.source === "llm_assisted"
        ? "BEDRO agent (AI-assisted, within your limits)"
        : "BEDRO agent"
      : o.source === "test_reply"
        ? "Test-inbox reply"
        : o.source === "simulated_supplier"
          ? "Simulated supplier"
          : "Supplier";
  const price = o.unit_price !== null ? ` ${o.unit_price} ${o.currency ?? currency} per unit` : "";
  const lead = o.lead_time_days !== null ? `, ${o.lead_time_days} days` : "";
  const mail =
    o.party === "buyer" && EMAILED[o.communication_status]
      ? ` · ${EMAILED[o.communication_status]}`
      : "";
  return `${who} ${VERB[o.action] ?? o.action}${price}${lead}${mail}`;
}

/** Business summary of the negotiation behind a conversation: each round's offer and answer, and what happens next. */
function NegotiationSummary({ id }: { id: string }) {
  const q = useQuery(negotiationQuery(id));
  if (!q.data) return null;
  const n = q.data;
  return (
    <section
      aria-label="Negotiation summary"
      className="max-h-48 overflow-y-auto border-b bg-accent/40 p-4 text-xs"
    >
      <h4 className="mb-2 font-semibold uppercase tracking-wider text-muted-foreground">
        Negotiation summary
      </h4>
      <ol className="space-y-1">
        {n.offers.map((o) => (
          <li key={o.id} className="flex gap-2">
            <span className="w-7 shrink-0 text-muted-foreground">R{o.round_number}</span>
            <span>{offerLine(o, n.currency)}</span>
          </li>
        ))}
      </ol>
      {n.recommendation && <p className="mt-2">{n.recommendation}</p>}
      <p className="mt-2 font-medium">{NEXT[n.status] ?? STATUS_LABEL[n.status].label}</p>
    </section>
  );
}

function SyncLine({ open, syncing }: { open: boolean; syncing: boolean }) {
  const q = useQuery({ ...syncStatusQuery, enabled: open });
  if (syncing)
    return (
      <p role="status" className="mt-1 text-xs">
        Checking the inbox for supplier replies…
      </p>
    );
  if (!q.data) return null;
  const { last_run: r, last_success: ok, polling_interval_seconds: every } = q.data;
  const auto =
    every > 0
      ? `Checked automatically every ${every}s; the agent answers valid replies.`
      : "Automatic checking is off (set APP_EMAIL_POLL_INTERVAL_SECONDS) — use Check inbox.";
  if (!r)
    return <p className="mt-1 text-xs text-muted-foreground">Inbox not checked yet. {auto}</p>;
  const c = r.counts;
  return (
    <p
      role="status"
      className={`mt-1 text-xs ${r.status === "error" ? "text-destructive" : "text-muted-foreground"}`}
    >
      {r.status === "error"
        ? `Last check failed (${fmt(toDate(r.started_at))}): ${r.error}.${ok ? ` Last successful check: ${fmt(toDate(ok.finished_at ?? ok.started_at))}.` : ""}`
        : `Last checked ${fmt(toDate(r.finished_at ?? r.started_at))}: ${c.new ?? 0} new, ${c.processed ?? 0} applied, ${c.needs_review ?? 0} need review, ${c.ignored ?? 0} unrelated ignored.`}{" "}
      {auto}
    </p>
  );
}

/** "PR-2026-001 · R-1, R-2": the procurement request(s) and requirement(s) this negotiation serves. */
function requestLabel(c: Conversation) {
  return (c.requests ?? [])
    .map((r) => {
      const reqs = r.requirements.map((q) => q.requirement_id ?? `row ${q.row_number}`).join(", ");
      return `${r.request_ref ?? "Request"}${reqs ? ` · ${reqs}` : ""}`;
    })
    .join(" | ");
}

function ConversationItem({
  c,
  active,
  onOpen,
}: {
  c: Conversation;
  active: boolean;
  onOpen: () => void;
}) {
  const s = STATUS_LABEL[c.negotiation_status as NegotiationStatus] ?? {
    label: c.negotiation_status,
    tone: "neutral" as const,
  };
  return (
    <button
      onClick={onOpen}
      aria-current={active}
      className={`surface w-full p-3 text-left text-sm transition ${active ? "ring-2 ring-primary" : "hover:-translate-y-0.5"}`}
    >
      <span className="flex items-baseline gap-2">
        <span className="min-w-0 flex-1 truncate font-semibold">{c.company_name}</span>
        <time className="shrink-0 text-[11px] text-muted-foreground">
          {fmt(toDate(c.latest_at))}
        </time>
      </span>
      <span className="block truncate text-xs text-muted-foreground">
        Supplier {c.supplier_id} · {c.material_name} · {c.scope_label}
      </span>
      {requestLabel(c) && (
        <span className="block truncate text-[11px] text-muted-foreground">{requestLabel(c)}</span>
      )}
      {c.reference && (
        <span className="block truncate font-mono text-[11px] text-muted-foreground">
          {c.reference}
        </span>
      )}
      <span className="mt-1 block truncate text-xs">
        {c.latest
          ? `${c.latest.direction === "outbound" ? "BEDRO: " : "Supplier: "}${c.latest.preview}`
          : "No messages yet"}
      </span>
      <span className="mt-2 flex flex-wrap gap-1">
        <Pill tone={s.tone}>{s.label}</Pill>
        {c.needs_review_count > 0 && <Pill tone="warning">{c.needs_review_count} need review</Pill>}
        {c.pending_send_count > 0 && <Pill tone="warning">{c.pending_send_count} not sent</Pill>}
        {c.is_test && <Pill tone="warning">Test inbox</Pill>}
      </span>
    </button>
  );
}

function ConversationView({
  c,
  email,
  onBack,
  onClose,
}: {
  c: Conversation;
  email: EmailStatus | undefined;
  onBack: () => void;
  onClose: () => void;
}) {
  const q = useQuery(communicationsQuery(c.negotiation_id));
  const s = STATUS_LABEL[c.negotiation_status as NegotiationStatus] ?? {
    label: c.negotiation_status,
    tone: "neutral" as const,
  };
  return (
    <div className="surface flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-start gap-2 border-b p-4">
        <button
          onClick={onBack}
          aria-label="Back to conversations"
          className="rounded-lg p-1.5 hover:bg-secondary md:hidden"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold">
            {c.company_name}{" "}
            <span className="text-xs font-normal text-muted-foreground">
              · Supplier {c.supplier_id}
            </span>
          </h3>
          <p className="text-xs text-muted-foreground">
            {requestLabel(c) && <>{requestLabel(c)} · </>}
            {c.material_name} · {c.scope_label} · round {c.current_round}/{c.max_rounds}
            {c.reference && (
              <>
                {" "}
                · <span className="font-mono">{c.reference}</span>
              </>
            )}
          </p>
        </div>
        <Pill tone={s.tone}>{s.label}</Pill>
        <Button size="sm" variant="outline" asChild>
          <Link to="/workspace/negotiations" onClick={onClose}>
            Negotiation details
          </Link>
        </Button>
      </header>
      <NegotiationSummary id={c.negotiation_id} />
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {q.isPending ? (
          <LoadingNotice>Loading messages…</LoadingNotice>
        ) : q.isError ? (
          <ErrorNotice title="Messages unavailable." error={q.error} />
        ) : q.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages in this conversation yet.</p>
        ) : (
          <ol className="space-y-3" aria-label="Messages, oldest first">
            {q.data.map((m) => (
              <MessageBubble key={m.id} m={m} />
            ))}
          </ol>
        )}
      </div>
      {q.data && <ProposalComposer c={c} email={email} msgs={q.data} />}
    </div>
  );
}

function UnmatchedView({ onBack }: { onBack: () => void }) {
  const q = useQuery(unmatchedQuery);
  return (
    <div className="surface flex h-full min-h-0 flex-col">
      <header className="flex items-start gap-2 border-b p-4">
        <button
          onClick={onBack}
          aria-label="Back to conversations"
          className="rounded-lg p-1.5 hover:bg-secondary md:hidden"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div>
          <h3 className="font-semibold">Unmatched replies</h3>
          <p className="text-xs text-muted-foreground">
            These replies refer to our proposals but cannot be tied to exactly one negotiation, so
            they changed nothing.
          </p>
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {q.isPending ? (
          <LoadingNotice>Loading…</LoadingNotice>
        ) : q.isError ? (
          <ErrorNotice title="Unmatched replies unavailable." error={q.error} />
        ) : q.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing to review.</p>
        ) : (
          <ol className="space-y-3">
            {q.data.map((m) => (
              <MessageBubble key={m.id} m={m} />
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function sender(m: EmailMessage) {
  if (m.direction === "outbound")
    return m.authorized_by === "buyer"
      ? "Procurement team (sent by you)"
      : m.authorized_by === "negotiation_agent"
        ? "BEDRO agent"
        : "BEDRO agent (not sent yet)";
  return `${m.is_test ? "Test-inbox tester" : "Supplier"} · ${m.from_address ?? "unknown sender"}`;
}

function MessageBubble({ m }: { m: EmailMessage }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const out = m.direction === "outbound";
  const s = MESSAGE_STATUS[m.status] ?? { label: m.status, tone: "neutral" as const };
  async function act(fn: () => Promise<EmailMessage>) {
    setBusy(true);
    setError(null);
    try {
      notifyMessageOutcome(await fn());
    } catch (e) {
      const msg = describeApiError(e);
      setError(msg);
      toast.error("Email action failed", { id: `email-${m.id}-error`, description: msg });
    }
    await invalidateEmail(qc);
    setBusy(false);
  }
  return (
    <li className={`flex ${out ? "justify-end" : "justify-start"}`}>
      <article
        aria-label={`${out ? "Outgoing" : "Incoming"} message`}
        className={`w-full max-w-[88%] rounded-2xl p-3 text-sm ${out ? "rounded-br-sm bg-primary/10" : "rounded-bl-sm bg-secondary"} ${m.linked === false ? "border border-dashed border-warning" : ""}`}
      >
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {out ? (
            <ArrowUpRight className="size-3.5 text-primary" />
          ) : (
            <ArrowDownLeft className="size-3.5 text-success" />
          )}
          <span className="font-semibold">{sender(m)}</span>
          <time className="ml-auto text-[11px] text-muted-foreground">{fmt(messageTime(m))}</time>
        </div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <Pill tone={s.tone}>{s.label}</Pill>
          {m.is_test && <Pill tone="warning">Test inbox</Pill>}
          {m.provider === "mock" && <Pill>Mock provider — simulated</Pill>}
          {m.linked === false && <Pill tone="warning">Not applied to the negotiation</Pill>}
        </div>
        {m.subject && <div className="mt-2 text-xs font-medium">{m.subject}</div>}
        <div className="text-[11px] text-muted-foreground">
          {out ? `to ${m.to_address}` : `to ${m.to_address ?? "our mailbox"}`}
          {m.reference_token && (
            <>
              {" "}
              · <span className="font-mono">{m.reference_token}</span>
            </>
          )}
        </div>
        {/* untrusted plain text: rendered as text, never as HTML */}
        <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words font-sans text-xs">
          {m.body_text}
        </pre>
        {m.review_reason && (
          <div className="mt-2 text-xs text-warning">Needs review: {m.review_reason}</div>
        )}
        {m.last_error && !DONE.includes(m.status) && (
          <div className="mt-1 text-xs text-destructive">{m.last_error}</div>
        )}
        {out && ["awaiting_authorization", "failed", "outcome_unknown"].includes(m.status) && (
          <div className="mt-2 flex flex-wrap gap-2">
            {m.status !== "outcome_unknown" ? (
              <Button size="sm" disabled={busy} onClick={() => act(() => sendMessage(m.id))}>
                {m.status === "failed" ? "Retry send" : "Send email"}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => act(() => reconcileMessage(m.id))}
              >
                Reconcile
              </Button>
            )}
          </div>
        )}
        {error && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            {error}
          </p>
        )}
      </article>
    </li>
  );
}

/** Emails the negotiation's CURRENT proposal. Terms come from the persisted offer and the recipient is chosen by
 * the backend (test inbox in test mode), so nothing typed here can change prices or redirect mail. */
function ProposalComposer({
  c,
  email,
  msgs,
}: {
  c: Conversation;
  email: EmailStatus | undefined;
  msgs: EmailMessage[];
}) {
  const qc = useQueryClient();
  const neg = useQuery(negotiationQuery(c.negotiation_id));
  const [busy, setBusy] = useState(false);
  const n = neg.data;
  if (!n || n.status !== "awaiting_supplier_response" || !c.mode.startsWith("email_")) return null;
  const offer = n.offers.find((o) => o.party === "buyer" && o.round_number === n.current_round);
  if (!offer) return null;
  const existing = msgs.find(
    (m) => m.direction === "outbound" && m.negotiation_offer_id === offer.id,
  );

  async function emailProposal() {
    setBusy(true);
    try {
      const prepared = await prepareEmail(c.negotiation_id);
      notifyMessageOutcome(
        DONE.includes(prepared.status) ? prepared : await sendMessage(prepared.id),
      );
    } catch (e) {
      toast.error("Email not sent", {
        id: `compose-${c.negotiation_id}`,
        description: describeApiError(e),
      });
    }
    await invalidateEmail(qc);
    setBusy(false);
  }

  return (
    <footer className="border-t p-4 text-xs">
      {existing && DONE.includes(existing.status) ? (
        <p className="text-muted-foreground">
          Round {offer.round_number} proposal was emailed. Waiting for the supplier's reply — use
          Check inbox to look for it.
        </p>
      ) : existing ? (
        <p className="text-muted-foreground">
          The round {offer.round_number} proposal is prepared above: use its Send button.
        </p>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <p className="min-w-0 flex-1 text-muted-foreground">
            Round {offer.round_number} proposal: {offer.unit_price} {offer.currency} per unit ×{" "}
            {offer.quantity} {offer.unit_of_measure}
            {offer.lead_time_days !== null &&
              `, delivery within ${offer.lead_time_days} days`}.{" "}
            {email?.test_mode
              ? `Goes only to the test inbox ${email.test_recipient}.`
              : "Goes to the supplier's verified contact."}
          </p>
          <Button size="sm" disabled={busy} onClick={emailProposal}>
            {busy ? "Sending…" : "Email this proposal"}
          </Button>
        </div>
      )}
      <p className="mt-2 text-[11px] text-muted-foreground">
        Supplier emails are generated from the negotiation's recorded proposal, so terms always
        match it. Free-text messages are not supported.
      </p>
    </footer>
  );
}
