import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest } from "./api";

/** Supplier email (backend Phase 6). Message bodies are untrusted plain text — always render as text. */
export type EmailStatus = {
  channel: "none" | "test" | "production" | "disabled";
  provider: string;
  test_mode: boolean;
  test_recipient: string | null;
  send_authorization: "agent" | "buyer";
  message: string;
  provider_status?: {
    configured?: boolean;
    /** backend-verified with a read-only provider request (Gmail profile), not inferred from files */
    state?: "connected" | "authorization_required" | "connection_failed";
    /** why the state is not "connected" (never contains secrets) */
    detail?: string | null;
    authorised_mailbox?: string | null;
    /** set when the authorised Gmail account cannot work (e.g. it is the test inbox itself) */
    problem?: string | null;
  } | null;
};

export type EmailMessage = {
  id: string;
  direction: "outbound" | "inbound";
  status: string;
  is_test: boolean;
  provider?: string;
  /** false: shown in the conversation for review only — it has not changed the negotiation */
  linked?: boolean;
  negotiation_id: string | null;
  negotiation_offer_id: number | null;
  from_address: string | null;
  to_address: string | null;
  subject: string | null;
  body_text: string | null;
  reference_token: string | null;
  authorized_by: string | null;
  send_attempts: number;
  last_error: string | null;
  interpretation: { classification: string; issues: string[] } | null;
  review_reason: string | null;
  received_at: string | null;
  sent_at: string | null;
  created_at: string;
};

export const MESSAGE_STATUS: Record<
  string,
  { label: string; tone: "primary" | "success" | "warning" | "danger" | "neutral" }
> = {
  awaiting_authorization: { label: "Awaiting authorization", tone: "warning" },
  sending: { label: "Sending…", tone: "primary" },
  accepted_by_provider: { label: "Accepted by provider — awaiting reply", tone: "primary" },
  reply_received: { label: "Reply received", tone: "success" },
  failed: { label: "Send failed", tone: "danger" },
  outcome_unknown: { label: "Outcome unknown — reconcile", tone: "warning" },
  bounced: { label: "Bounced", tone: "danger" },
  cancelled: { label: "Cancelled before sending", tone: "neutral" },
  received: { label: "Received", tone: "primary" },
  processed: { label: "Processed", tone: "success" },
  needs_review: { label: "Needs review", tone: "warning" },
  late_reply: { label: "Late reply (no change)", tone: "neutral" },
  bounce_notice: { label: "Bounce notice", tone: "danger" },
  ignored: { label: "Dismissed", tone: "neutral" },
};

const enc = encodeURIComponent;

/** Backend timestamps are UTC; values without an offset (SQLite) must not be read as local time. */
export const toDate = (s: string) => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : `${s}Z`);
export const messageTime = (m: EmailMessage) => toDate(m.sent_at ?? m.received_at ?? m.created_at);

export const emailStatusQuery = queryOptions({
  queryKey: ["email-status"],
  queryFn: ({ signal }) => apiRequest<EmailStatus>("/email/status", { signal }),
  retry: false,
});
export const communicationsQuery = (negotiationId: string) =>
  queryOptions({
    queryKey: ["communications", negotiationId],
    queryFn: ({ signal }) =>
      apiRequest<EmailMessage[]>(`/negotiations/${enc(negotiationId)}/communications`, { signal }),
    retry: false,
  });
export const reviewQueueQuery = queryOptions({
  queryKey: ["email-review"],
  queryFn: ({ signal }) => apiRequest<EmailMessage[]>("/email/messages?review=true", { signal }),
  retry: false,
});

export const useEmailStatus = () => useQuery(emailStatusQuery);

/** One conversation per negotiation: the supplier's database ID plus that negotiation's context. */
export type Conversation = {
  /** procurement request(s) + requirement(s) of this workspace that the negotiation serves */
  requests?: {
    request_id: string;
    request_ref: string | null;
    requirements: {
      item_id: string | null;
      requirement_id: string | null;
      row_number: number | null;
    }[];
  }[];
  negotiation_id: string;
  supplier_id: string;
  company_name: string;
  material_name: string | null;
  subject_type: "requirement_item" | "demand_pool";
  scope_label: string;
  reference: string | null;
  negotiation_status: string;
  mode: string;
  is_test: boolean;
  current_round: number;
  max_rounds: number;
  message_count: number;
  needs_review_count: number;
  pending_send_count: number;
  latest_at: string;
  latest: { direction: "outbound" | "inbound"; status: string; preview: string } | null;
};
export type Conversations = { conversations: Conversation[]; unmatched_count: number };

export type SyncResult = {
  fetched: number;
  new: number;
  duplicates: number;
  ignored: number;
  processed: number;
  needs_review: number;
  late: number;
  bounces: number;
  resent?: number; // agent proposals whose earlier send failed, sent on this check
  reminders?: number; // supplier-silence reminders sent
  escalations?: number; // silent or bounced negotiations escalated to you
  skipped?: boolean; // another inbox check was already running
  error: string | null;
};
export type SyncRun = {
  id: number;
  trigger: string;
  status: "running" | "ok" | "error";
  counts: Partial<Record<keyof SyncResult, number>>;
  error: string | null;
  started_at: string;
  finished_at: string | null;
};
export type SyncStatus = {
  last_run: SyncRun | null;
  last_success: SyncRun | null;
  polling_interval_seconds: number;
};

/** Changes whenever a conversation gets new activity or a new item needing the buyer. */
export const activitySignature = (c: Conversation) =>
  `${c.latest_at}|${c.needs_review_count}|${c.pending_send_count}|${c.negotiation_status}`;

/** Conversations needing attention that the buyer has not looked at since their last change (+ unseen unmatched). */
export function unseenAttention(data: Conversations | undefined, seen: Record<string, string>): number {
  if (!data) return 0;
  const needs = (c: Conversation) =>
    c.needs_review_count + c.pending_send_count + (c.negotiation_status === "awaiting_buyer_decision" ? 1 : 0) > 0;
  const convs = data.conversations.filter((c) => needs(c) && seen[c.negotiation_id] !== activitySignature(c)).length;
  return convs + (data.unmatched_count > 0 && seen["unmatched"] !== String(data.unmatched_count) ? 1 : 0);
}

export const conversationsQuery = queryOptions({
  queryKey: ["email-conversations"],
  queryFn: ({ signal }) => apiRequest<Conversations>("/email/conversations", { signal }),
  retry: false,
});
export const unmatchedQuery = queryOptions({
  queryKey: ["email-unmatched"],
  queryFn: ({ signal }) => apiRequest<EmailMessage[]>("/email/messages?unmatched=true", { signal }),
  retry: false,
});
export const syncStatusQuery = queryOptions({
  queryKey: ["email-sync-status"],
  queryFn: ({ signal }) => apiRequest<SyncStatus>("/email/sync/status", { signal }),
  retry: false,
});

export const syncInbox = () =>
  apiRequest<SyncResult>("/email/sync", { method: "POST", timeoutMs: 60_000 });
export const prepareEmail = (negotiationId: string) =>
  apiRequest<EmailMessage>(`/negotiations/${enc(negotiationId)}/emails`, { method: "POST" });
export const sendMessage = (id: string, confirmNotSent = false) =>
  apiRequest<EmailMessage>(`/email/messages/${enc(id)}/send`, {
    method: "POST",
    body: { confirm_not_sent: confirmNotSent },
    timeoutMs: 45_000,
  });
export const reconcileMessage = (id: string) =>
  apiRequest<EmailMessage>(`/email/messages/${enc(id)}/reconcile`, { method: "POST" });

/** After any email change: refresh conversations, threads, review lists, sync status and negotiations. */
export const invalidateEmail = (qc: QueryClient) =>
  Promise.all(
    [
      "email-conversations",
      "communications",
      "email-review",
      "email-unmatched",
      "email-sync-status",
      "negotiations",
      "negotiation",
      "procurement-requests",
    ].map((k) => qc.invalidateQueries({ queryKey: [k] })),
  );

/** Toast for a backend-confirmed message outcome. Keyed by message + status, so a refresh or repeat never stacks. */
export function notifyMessageOutcome(m: EmailMessage) {
  const id = `email-${m.id}-${m.status}`;
  if (m.status === "accepted_by_provider" || m.status === "reply_received") {
    if (m.provider === "mock")
      toast.success("Email recorded by the mock provider", {
        id,
        description: "Simulated: nothing left this machine.",
      });
    else
      toast.success(m.is_test ? "Test email accepted by Gmail" : "Email accepted by Gmail", {
        id,
        description: `To ${m.to_address}${m.is_test ? " (development test inbox)" : ""}. Gmail does not confirm delivery.`,
      });
  } else if (m.status === "failed")
    toast.error("Email not sent", {
      id,
      description: m.last_error ?? "The provider rejected the message.",
    });
  else if (m.status === "outcome_unknown")
    toast.warning("Email outcome unknown", {
      id,
      description: "It may have been sent. Reconcile in Supplier Communications before retrying.",
    });
  else if (m.status === "awaiting_authorization")
    toast.info("Email prepared — awaiting your Send", { id, description: m.subject ?? undefined });
}

export function notifySyncResult(r: SyncResult) {
  if (r.error) {
    toast.error("Inbox check failed", { id: "email-sync", description: r.error });
    return;
  }
  if (r.skipped) {
    toast.info("Inbox check already running", {
      id: "email-sync",
      description: "Another check (automatic or manual) is processing replies now.",
    });
    return;
  }
  const parts = [
    `${r.new} new repl${r.new === 1 ? "y" : "ies"}`,
    r.processed && `${r.processed} applied to negotiations (agent responded where authorised)`,
    r.resent && `${r.resent} pending email${r.resent === 1 ? "" : "s"} sent`,
    r.reminders && `${r.reminders} reminder${r.reminders === 1 ? "" : "s"} to silent suppliers`,
    r.escalations && `${r.escalations} escalated to you`,
    r.needs_review && `${r.needs_review} need review`,
    r.ignored && `${r.ignored} unrelated ignored`,
  ].filter(Boolean);
  (r.needs_review ? toast.warning : toast.success)("Inbox checked", {
    id: "email-sync",
    description: parts.join(" · "),
  });
}
