import { n as useQuery, t as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { u as apiRequest } from "./query-notice-CfqlvxHB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/procurement-CAPgAIqk.js
var enc = encodeURIComponent;
var requestsQuery = queryOptions({
	queryKey: ["procurement-requests"],
	queryFn: ({ signal }) => apiRequest("/procurement-requests", { signal }),
	retry: 1
});
var requestQuery = (id) => queryOptions({
	queryKey: ["procurement-requests", id],
	queryFn: ({ signal }) => apiRequest(`/procurement-requests/${enc(id)}`, { signal }),
	retry: 1
});
var useRequests = () => useQuery(requestsQuery);
/** Request-level agent negotiation. Omit itemIds for every eligible requirement of the request. */
var negotiateRequest = (id, itemIds) => apiRequest(`/procurement-requests/${enc(id)}/negotiate`, {
	method: "POST",
	body: itemIds ? { item_ids: itemIds } : {},
	timeoutMs: 12e4
});
var invalidateRequests = (qc) => qc.invalidateQueries({ queryKey: ["procurement-requests"] });
var REQUIREMENT_STATUS = {
	not_started: {
		label: "Not started",
		tone: "neutral"
	},
	active: {
		label: "Negotiating",
		tone: "primary"
	},
	pending_review: {
		label: "Awaiting your decision",
		tone: "warning"
	},
	completed: {
		label: "Completed",
		tone: "success"
	},
	unresolved: {
		label: "Unresolved",
		tone: "danger"
	},
	cancelled: {
		label: "Cancelled",
		tone: "neutral"
	}
};
var REQUEST_STATUS = {
	not_started: {
		label: "Not started",
		tone: "neutral"
	},
	in_progress: {
		label: "In progress",
		tone: "primary"
	},
	awaiting_buyer_decision: {
		label: "Awaiting your decision",
		tone: "warning"
	},
	needs_attention: {
		label: "Needs attention",
		tone: "danger"
	},
	completed: {
		label: "Completed",
		tone: "success"
	},
	failed: {
		label: "No valid requirements",
		tone: "danger"
	},
	cancelled: {
		label: "Cancelled",
		tone: "neutral"
	}
};
/** Overview analytics: every active requirement of this workspace in exactly one sourcing stage, summed from the
*  backend's own per-request status counts (GET /procurement-requests, workspace scoped). Cancelled items are
*  not part of the total. Colors are BEDRO chart tokens in a CVD-checked order (adjacent segments stay distinct). */
var SOURCING_STAGES = [
	{
		key: "not_started",
		label: "Not yet sourced",
		description: "Validated requirements with no supplier negotiation yet",
		color: "var(--chart-5)"
	},
	{
		key: "active",
		label: "Awaiting supplier response",
		description: "Being sourced: a proposal was sent and the supplier has not answered yet",
		color: "var(--chart-1)"
	},
	{
		key: "pending_review",
		label: "Offer to review",
		description: "Matched with a supplier offer that awaits your decision or a manual review",
		color: "var(--chart-4)"
	},
	{
		key: "unresolved",
		label: "Closed without agreement",
		description: "Every negotiation for it ended without a deal",
		color: "var(--chart-2)"
	},
	{
		key: "completed",
		label: "Sourcing decision completed",
		description: "You accepted a verified supplier offer",
		color: "var(--chart-3)"
	}
];
function sourcingBreakdown(requests) {
	const segments = SOURCING_STAGES.map((s) => ({
		...s,
		value: requests.reduce((n, r) => n + (r.counts[s.key] ?? 0), 0)
	}));
	return {
		total: segments.reduce((n, s) => n + s.value, 0),
		segments
	};
}
//#endregion
export { requestQuery as a, negotiateRequest as i, REQUIREMENT_STATUS as n, sourcingBreakdown as o, invalidateRequests as r, useRequests as s, REQUEST_STATUS as t };
