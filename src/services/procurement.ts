import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";
import { apiRequest } from "./api";
import type { NegotiationStatus } from "./negotiations";

/** Procurement requests (one per uploaded requirements file) → requirements → supplier negotiations.
 *  Every status and count is computed by the backend; the UI only displays it. */
export type RequirementStatus =
  "not_started" | "active" | "pending_review" | "completed" | "unresolved" | "cancelled";
export type RequestStatus =
  | "not_started"
  | "in_progress"
  | "awaiting_buyer_decision"
  | "needs_attention"
  | "completed"
  | "failed"
  | "cancelled";

export type RequestSummary = {
  id: string;
  request_ref: string | null;
  original_filename: string;
  uploaded_at: string;
  batch_status: string;
  total_requirements: number;
  rejected_rows: number;
  counts: Record<RequirementStatus, number>;
  status: RequestStatus;
};

export type SupplierNegotiationRow = {
  negotiation_id: string;
  status: NegotiationStatus;
  mode: string;
  pooled: boolean;
  supplier_id: string;
  supplier_name: string;
  registered_email: string | null;
  /** why the supplier's address cannot be used (missing / invalid / conflicting) */
  email_problem: string | null;
  /** why the current proposal was not emailed, if it was not */
  send_problem: string | null;
  offering_id: string;
  currency: string;
  current_price: number | null;
  current_round: number;
  max_rounds: number;
  reference: string | null;
  latest_response: {
    action: string | null;
    round: number | null;
    unit_price: number | null;
    currency: string | null;
    simulated: boolean;
    email_status: string | null;
    received_at: string | null;
  } | null;
  message_count: number;
  last_activity: string;
  can_cancel: boolean;
  awaiting_buyer_decision: boolean;
};

export type RequirementRow = {
  id: string;
  requirement_id: string | null;
  row_number: number;
  item_name: string;
  component_category: string;
  material_grade: string | null;
  quantity: number;
  unit: string;
  budget_per_unit: number | null;
  currency: string | null;
  required_delivery_days: number | null;
  status: RequirementStatus;
  negotiation_count: number;
  negotiations: SupplierNegotiationRow[];
  /** the buyer's saved supplier choice (used by Negotiate Using Agent after re-validation) */
  selection?: { offering_id: string; supplier_id: string; company_name: string } | null;
};

export type RequestDetail = RequestSummary & { requirements: RequirementRow[] };

export type NegotiateOutcome = {
  item_id: string;
  requirement_id: string | null;
  item_name: string;
  outcome: "started" | "active" | "skipped" | "failed";
  reason: string;
  negotiation_id: string | null;
  supplier_id: string | null;
  offering_id?: string | null;
  /** saved_selection = the buyer's saved supplier; agent_selection = existing agent rule (top-ranked eligible) */
  selection_source?: "saved_selection" | "agent_selection" | null;
  request_id?: string;
  email_status: string | null;
};
export type NegotiateResult = {
  request_id: string;
  request_ref: string | null;
  processed: number;
  summary: Record<NegotiateOutcome["outcome"], number>;
  results: NegotiateOutcome[];
  request: RequestDetail;
};

const enc = encodeURIComponent;

export const requestsQuery = queryOptions({
  queryKey: ["procurement-requests"],
  queryFn: ({ signal }) => apiRequest<RequestSummary[]>("/procurement-requests", { signal }),
  retry: 1,
});
export const requestQuery = (id: string) =>
  queryOptions({
    queryKey: ["procurement-requests", id],
    queryFn: ({ signal }) =>
      apiRequest<RequestDetail>(`/procurement-requests/${enc(id)}`, { signal }),
    retry: 1,
  });
export const useRequests = () => useQuery(requestsQuery);

/** Request-level agent negotiation. Omit itemIds for every eligible requirement of the request. */
export const negotiateRequest = (id: string, itemIds?: string[]) =>
  apiRequest<NegotiateResult>(`/procurement-requests/${enc(id)}/negotiate`, {
    method: "POST",
    body: itemIds ? { item_ids: itemIds } : {},
    timeoutMs: 120_000,
  });

export const invalidateRequests = (qc: QueryClient) =>
  qc.invalidateQueries({ queryKey: ["procurement-requests"] });

type Tone = "primary" | "success" | "warning" | "danger" | "neutral";
export const REQUIREMENT_STATUS: Record<RequirementStatus, { label: string; tone: Tone }> = {
  not_started: { label: "Not started", tone: "neutral" },
  active: { label: "Negotiating", tone: "primary" },
  pending_review: { label: "Awaiting your decision", tone: "warning" },
  completed: { label: "Completed", tone: "success" },
  unresolved: { label: "Unresolved", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};
export const REQUEST_STATUS: Record<RequestStatus, { label: string; tone: Tone }> = {
  not_started: { label: "Not started", tone: "neutral" },
  in_progress: { label: "In progress", tone: "primary" },
  awaiting_buyer_decision: { label: "Awaiting your decision", tone: "warning" },
  needs_attention: { label: "Needs attention", tone: "danger" },
  completed: { label: "Completed", tone: "success" },
  failed: { label: "No valid requirements", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

/** Overview analytics: every active requirement of this workspace in exactly one sourcing stage, summed from the
 *  backend's own per-request status counts (GET /procurement-requests, workspace scoped). Cancelled items are
 *  not part of the total. Colors are BEDRO chart tokens in a CVD-checked order (adjacent segments stay distinct). */
export const SOURCING_STAGES: { key: Exclude<RequirementStatus, "cancelled">; label: string; description: string; color: string }[] = [
  { key: "not_started", label: "Not yet sourced", description: "Validated requirements with no supplier negotiation yet", color: "var(--chart-5)" },
  { key: "active", label: "Awaiting supplier response", description: "Being sourced: a proposal was sent and the supplier has not answered yet", color: "var(--chart-1)" },
  { key: "pending_review", label: "Offer to review", description: "Matched with a supplier offer that awaits your decision or a manual review", color: "var(--chart-4)" },
  { key: "unresolved", label: "Closed without agreement", description: "Every negotiation for it ended without a deal", color: "var(--chart-2)" },
  { key: "completed", label: "Sourcing decision completed", description: "You accepted a verified supplier offer", color: "var(--chart-3)" },
];

export type SourcingBreakdown = { total: number; segments: ((typeof SOURCING_STAGES)[number] & { value: number })[] };

export function sourcingBreakdown(requests: RequestSummary[]): SourcingBreakdown {
  const segments = SOURCING_STAGES.map((s) => ({
    ...s,
    value: requests.reduce((n, r) => n + (r.counts[s.key] ?? 0), 0),
  }));
  return { total: segments.reduce((n, s) => n + s.value, 0), segments };
}
