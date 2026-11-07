import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";
import { apiRequest, fetchAllPages } from "./api";

/** Demand pools come from the backend pooling service (deterministic compatibility rules). No pricing data. */
export type PoolStatus = "confirmed" | "inactive";
/** Human in the loop: only an approved pool's combined demand is negotiated (and emailed to a supplier); a rejected
 *  pool's requirements are sourced individually. Any change to the pool's members resets it to pending. */
export type PoolApproval = "pending" | "approved" | "rejected";
export type PoolOutcome =
  "pooled" | "needs_clarification" | "incompatible" | "no_match" | "excluded";

export type PoolConstraints = {
  minimum_quality_rating: number | null;
  required_certifications: string[];
  compliance_requirements: string[];
  substitution_allowed: boolean | null;
};

/** Members from another company workspace are anonymised by the backend: `own` is false and ids, file, row and
 *  buyer are null — only quantity, unit and deadline are shared. */
export type PoolMember = {
  item_id: string | null;
  batch_id: string | null;
  batch_filename: string;
  row_number: number | null;
  source_requirement_id: string | null;
  buyer_company_name: string | null;
  requested_quantity: number;
  allocated_quantity: number;
  unit_of_measure: string;
  delivery_deadline: string;
  active: boolean;
  removed_at: string | null;
  removal_reason: string | null;
  own?: boolean;
};

export type Pool = {
  id: string;
  status: PoolStatus;
  component_category: string;
  material_name: string;
  unit_of_measure: string;
  technical_specification: string;
  constraints: PoolConstraints;
  aggregate_quantity: number;
  member_count: number;
  earliest_deadline: string;
  latest_deadline: string;
  last_recalculated_at: string;
  /** this workspace's active requirements in the pool and their combined quantity */
  own_member_count?: number;
  own_quantity?: number;
  approval_status: PoolApproval;
  approval_decided_at: string | null;
  approval_note: string | null;
  members: PoolMember[];
};

export type ItemAssessment = {
  item_id: string;
  batch_id: string;
  batch_filename: string;
  row_number: number;
  source_requirement_id: string | null;
  component_category: string;
  material_name: string;
  required_quantity: number;
  unit_of_measure: string;
  outcome: PoolOutcome;
  pool_id: string | null;
  reasons: string[];
  delivery_deadline: string | null;
};

const enc = encodeURIComponent;

/** Confirmed pools with their member items (traceable to batch and row). */
export async function fetchPools(signal?: AbortSignal): Promise<Pool[]> {
  const summaries = await fetchAllPages<Omit<Pool, "members">>(
    "/demand-pools?status=confirmed",
    signal,
  );
  return Promise.all(
    summaries.map((s) => apiRequest<Pool>(`/demand-pools/${enc(s.id)}`, signal ? { signal } : {})),
  );
}

export const fetchAssessments = (signal?: AbortSignal) =>
  fetchAllPages<ItemAssessment>("/demand-pools/item-assessments", signal);

export const recalculatePools = () =>
  apiRequest<Record<string, number | string>>("/demand-pools/recalculate", { method: "POST" });

export const decidePool = (id: string, decision: "approve" | "reject", note?: string) =>
  apiRequest<Pool>(`/demand-pools/${enc(id)}/${decision}`, {
    method: "POST",
    body: note ? { note } : {},
  });

export const poolsQuery = queryOptions({
  queryKey: ["demand-pools"],
  queryFn: ({ signal }) => fetchPools(signal),
  retry: 1,
});
export const assessmentsQuery = queryOptions({
  queryKey: ["pool-assessments"],
  queryFn: ({ signal }) => fetchAssessments(signal),
  retry: 1,
});

export const usePools = () => useQuery(poolsQuery);
export const useAssessments = () => useQuery(assessmentsQuery);

/** Pools are recalculated by the backend after uploads/cancellations; refresh the cached views. */
export const invalidatePooling = (qc: QueryClient) =>
  Promise.all([
    qc.invalidateQueries({ queryKey: poolsQuery.queryKey }),
    qc.invalidateQueries({ queryKey: assessmentsQuery.queryKey }),
  ]);
