import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";
import { apiRequest, fetchAllPages } from "./api";

/** Supplier matching and negotiations come from the backend agent workflow. Values shown are backend facts. */
export type SubjectType = "requirement_item" | "demand_pool";

export type Check = {
  check: string;
  mandatory: boolean;
  status: "pass" | "fail" | "unknown" | "info";
  detail: string;
  required: string | null;
  offered: string | null;
};

export type Candidate = {
  offering_id: string;
  supplier_id: string;
  company_name: string;
  material_name: string;
  material_grade: string | null;
  unit_price: string;
  currency: string;
  unit_of_measure: string | null;
  minimum_order_quantity: number | null;
  available_quantity: number | null;
  lead_time_days: number | null;
  quality_rating: number | null;
  country_of_origin: string | null;
  data_source: string;
  status: "eligible" | "needs_review" | "ineligible";
  score: string | null;
  score_breakdown: Record<string, string>;
  rank: number | null;
  checks: Check[];
  limitations: string[];
};

export type Matches = {
  shortlist: Candidate[];
  eligible: Candidate[];
  needs_review: Candidate[];
  ineligible: Candidate[];
  other_category_offerings: number;
  ranking: { weights: Record<string, string>; factors_used: string[]; note?: string | null };
  active_negotiation_id: string | null;
  /** requirement items only: the procurement request the item belongs to */
  request_id?: string;
  /** requirement items only: the buyer's saved supplier choice, re-validated against current eligibility */
  selection?: SupplierSelection | null;
  /** an active negotiation (item or pool) already covering some of this demand; starting is refused meanwhile */
  overlapping_negotiation_id?: string | null;
  context: {
    quantity: string;
    unit_of_measure: string;
    budget_per_unit: string | null;
    currency: string | null;
    deadline: string | null;
    budget_note: string | null;
  };
};

export type SupplierSelection = {
  item_id: string;
  request_id: string;
  offering_id: string;
  supplier_id: string;
  company_name: string;
  selected_at: string;
  updated_at: string;
  /** null when not re-checked; false = no longer eligible (see reason) */
  eligible: boolean | null;
  reason: string | null;
};

export type NegotiationStatus =
  | "awaiting_supplier_response"
  | "awaiting_buyer_decision"
  | "manual_review_required"
  | "accepted_by_buyer"
  | "rejected_by_buyer"
  | "supplier_rejected"
  | "no_agreement"
  | "round_limit_reached"
  | "verification_failed"
  | "cancelled";

export type Offer = {
  id: number;
  round_number: number;
  party: "buyer" | "supplier";
  source: "policy" | "llm_assisted" | "simulated_supplier" | "supplier_reply" | "test_reply";
  action: string;
  simulated: boolean;
  unit_price: number | null;
  currency: string | null;
  quantity: number | null;
  unit_of_measure: string | null;
  lead_time_days: number | null;
  quoted_total: number | null;
  message: string | null;
  rationale: string;
  llm_status: string;
  communication_status: string;
  verification: {
    status: "verified" | "rejected" | "needs_review";
    checks: Check[];
    computed_total: number | null;
  } | null;
};

export type NegotiationSummary = {
  id: string;
  status: NegotiationStatus;
  mode: "simulated" | "live" | "email_test" | "email_live";
  simulated: boolean;
  subject_type: SubjectType;
  subject_id: string;
  material_name: string;
  quantity: number;
  unit_of_measure: string;
  currency: string;
  supplier_id: string;
  company_name: string;
  offering_id: string;
  current_round: number;
  max_rounds: number;
  latest_unit_price: number | null;
  updated_at: string;
};

export type AgentDecision = {
  action:
    | "counteroffer"
    | "accept_pending_buyer_approval"
    | "request_clarification"
    | "escalate_to_buyer"
    | "stop";
  reason: string;
  tactic: "concede" | "hold" | "closing" | "trade_off" | null;
  next_round: number;
  requires_buyer_approval: boolean;
  alternatives: { company_name: string; offering_id: string; unit_price: string; currency: string }[];
};

export type OutcomeEmail = {
  outcome: "award" | "closure";
  message_id: string | null;
  status: string; // pending | awaiting_authorization | sending | accepted_by_provider | failed | outcome_unknown | not_sent
  last_error: string | null;
  send_attempts: number;
};

export type SupplierIntent = {
  intent: string;
  sentiment: string | null;
  confidence: number | null;
  unit_price: string | null;
  currency: string | null;
  quantity: string | null;
  lead_time_days: number | null;
  payment_terms: string | null;
  warranty: string | null;
  landed_cost_complete: boolean | null;
  conditions: string[] | null;
  message_status: string;
  review_reason: string | null;
};

export type NegotiationDetail = NegotiationSummary & {
  selection_method: "buyer" | "agent_auto";
  selection_reason: string;
  list_unit_price: number;
  budget_per_unit: number;
  target_unit_price: number;
  ceiling_unit_price: number;
  recommendation: string | null;
  final_offer_id: number | null;
  offers: Offer[];
  decision: {
    decision: "accepted" | "rejected";
    offer_was_simulated: boolean;
    decided_at: string;
  } | null;
  allowed_actions: ("advance" | "accept" | "reject" | "cancel")[];
  notices: string[];
  /** The agent's most recent decision, persisted before any email was sent. */
  latest_decision?: AgentDecision | null;
  /** Award/closure email delivery, separate from the decision itself. */
  outcome_email?: OutcomeEmail | null;
  /** The latest interpreted supplier reply (intent, tone, confidence, key terms, review reason). */
  latest_intent?: SupplierIntent | null;
  context: {
    allocations: {
      item_id: string;
      batch_filename: string;
      row_number: number;
      source_requirement_id: string | null;
      quantity: string;
      unit_of_measure: string;
    }[];
  };
};

const enc = encodeURIComponent;
const sig = (signal?: AbortSignal) => (signal ? { signal } : {});

export const fetchMatches = (type: SubjectType, id: string, signal?: AbortSignal) =>
  apiRequest<Matches>(
    type === "demand_pool"
      ? `/demand-pools/${enc(id)}/supplier-matches`
      : `/requirement-items/${enc(id)}/supplier-matches`,
    sig(signal),
  );

export const fetchNegotiations = (signal?: AbortSignal) =>
  fetchAllPages<NegotiationSummary>("/negotiations", signal, 200);
export const fetchNegotiation = (id: string, signal?: AbortSignal) =>
  apiRequest<NegotiationDetail>(`/negotiations/${enc(id)}`, sig(signal));

export const startNegotiation = (body: {
  subject_type: SubjectType;
  subject_id: string;
  offering_id?: string;
  auto_select?: boolean;
}) => apiRequest<NegotiationDetail>("/negotiations", { method: "POST", body });
/** Saves (or changes) the buyer's supplier for one requirement. Never starts a negotiation. */
export const saveSupplierSelection = (
  itemId: string,
  body: { request_id: string; offering_id: string; supplier_id: string },
) =>
  apiRequest<SupplierSelection>(`/requirement-items/${enc(itemId)}/supplier-selection`, {
    method: "PUT",
    body,
  });
export const clearSupplierSelection = (itemId: string, requestId: string) =>
  apiRequest<null>(
    `/requirement-items/${enc(itemId)}/supplier-selection?request_id=${enc(requestId)}`,
    { method: "DELETE" },
  );
export const advanceNegotiation = (id: string, expectedRound: number) =>
  apiRequest<NegotiationDetail>(`/negotiations/${enc(id)}/advance`, {
    method: "POST",
    body: { expected_round: expectedRound },
  });
export const cancelNegotiation = (id: string) =>
  apiRequest<NegotiationDetail>(`/negotiations/${enc(id)}/cancel`, { method: "POST" });
export const decideNegotiation = (id: string, decision: "accept" | "reject") =>
  apiRequest<NegotiationDetail>(`/negotiations/${enc(id)}/decision`, {
    method: "POST",
    body: { decision },
  });

export const matchesQuery = (type: SubjectType, id: string) =>
  queryOptions({
    queryKey: ["supplier-matches", type, id],
    queryFn: ({ signal }) => fetchMatches(type, id, signal),
    retry: false,
  });
export const negotiationsQuery = queryOptions({
  queryKey: ["negotiations"],
  queryFn: ({ signal }) => fetchNegotiations(signal),
  retry: 1,
  // The backend advances negotiations on its own (inbox polling): keep lists, Overview and decisions current.
  refetchInterval: 30_000,
});
export const negotiationQuery = (id: string) =>
  queryOptions({
    queryKey: ["negotiation", id],
    queryFn: ({ signal }) => fetchNegotiation(id, signal),
    retry: 1,
    // Replies are answered by the backend (inbox polling); refresh while one may arrive so the UI shows the outcome.
    refetchInterval: (query) =>
      query.state.data?.status === "awaiting_supplier_response" ? 30_000 : false,
  });

export const useNegotiations = () => useQuery(negotiationsQuery);

/** After any negotiation change, refresh lists, details, matches, requests and the email views that show the
 *  outcome email (a buyer decision now sends one). */
export const invalidateNegotiations = (qc: QueryClient) =>
  Promise.all(
    ["negotiations", "negotiation", "supplier-matches", "procurement-requests", "email-conversations", "communications"]
      .map((k) => qc.invalidateQueries({ queryKey: [k] })),
  );

/** Canonical buyer-facing stage of a persisted negotiation status (one place, used by every count and summary).
 *  An agreed supplier offer is "awaiting_approval" until the buyer accepts — never counted as concluded. */
export type NegotiationStage = "negotiating" | "awaiting_approval" | "needs_review" | "concluded_success" | "concluded_no_deal";
export const STAGE: Record<NegotiationStatus, NegotiationStage> = {
  awaiting_supplier_response: "negotiating",
  awaiting_buyer_decision: "awaiting_approval",
  manual_review_required: "needs_review",
  accepted_by_buyer: "concluded_success",
  rejected_by_buyer: "concluded_no_deal",
  supplier_rejected: "concluded_no_deal",
  no_agreement: "concluded_no_deal",
  round_limit_reached: "concluded_no_deal",
  verification_failed: "concluded_no_deal",
  cancelled: "concluded_no_deal",
};
export const STAGE_LABEL: Record<NegotiationStage, string> = {
  negotiating: "Negotiating",
  awaiting_approval: "Awaiting your approval",
  needs_review: "Needs review",
  concluded_success: "Agreed (approved by you)",
  concluded_no_deal: "Closed without agreement",
};
export function countByStage(list: { status: NegotiationStatus }[]): Record<NegotiationStage, number> {
  const out = { negotiating: 0, awaiting_approval: 0, needs_review: 0, concluded_success: 0, concluded_no_deal: 0 };
  for (const n of list) out[STAGE[n.status] ?? "negotiating"] += 1;
  return out;
}

/** Supplier outcome-email delivery, as confirmed by the backend (never "sent" before the provider accepted it). */
export const OUTCOME_EMAIL_LABEL: Record<string, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  pending: { label: "Pending — sent on the next inbox check", tone: "warning" },
  awaiting_authorization: { label: "Prepared — awaiting your Send", tone: "warning" },
  sending: { label: "Sending…", tone: "neutral" },
  accepted_by_provider: { label: "Sent", tone: "success" },
  reply_received: { label: "Sent", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  outcome_unknown: { label: "Awaiting provider verification", tone: "warning" },
  bounced: { label: "Bounced", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  not_sent: { label: "Not sent", tone: "danger" },
};

export const STATUS_LABEL: Record<
  NegotiationStatus,
  { label: string; tone: "primary" | "success" | "warning" | "danger" | "neutral" }
> = {
  awaiting_supplier_response: { label: "Awaiting supplier response", tone: "primary" },
  awaiting_buyer_decision: { label: "Awaiting your decision", tone: "warning" },
  manual_review_required: { label: "Manual review required", tone: "warning" },
  accepted_by_buyer: { label: "Accepted by you", tone: "success" },
  rejected_by_buyer: { label: "Rejected by you", tone: "neutral" },
  supplier_rejected: { label: "Supplier rejected", tone: "danger" },
  no_agreement: { label: "No agreement", tone: "danger" },
  round_limit_reached: { label: "Round limit reached", tone: "danger" },
  verification_failed: { label: "Verification failed", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};
