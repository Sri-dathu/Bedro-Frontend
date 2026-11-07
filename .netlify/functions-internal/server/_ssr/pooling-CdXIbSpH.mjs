import { n as useQuery, t as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { p as fetchAllPages, u as apiRequest } from "./query-notice-CfqlvxHB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pooling-CdXIbSpH.js
var enc = encodeURIComponent;
/** Confirmed pools with their member items (traceable to batch and row). */
async function fetchPools(signal) {
	const summaries = await fetchAllPages("/demand-pools?status=confirmed", signal);
	return Promise.all(summaries.map((s) => apiRequest(`/demand-pools/${enc(s.id)}`, signal ? { signal } : {})));
}
var fetchAssessments = (signal) => fetchAllPages("/demand-pools/item-assessments", signal);
var recalculatePools = () => apiRequest("/demand-pools/recalculate", { method: "POST" });
var decidePool = (id, decision, note) => apiRequest(`/demand-pools/${enc(id)}/${decision}`, {
	method: "POST",
	body: note ? { note } : {}
});
var poolsQuery = queryOptions({
	queryKey: ["demand-pools"],
	queryFn: ({ signal }) => fetchPools(signal),
	retry: 1
});
var assessmentsQuery = queryOptions({
	queryKey: ["pool-assessments"],
	queryFn: ({ signal }) => fetchAssessments(signal),
	retry: 1
});
var usePools = () => useQuery(poolsQuery);
var useAssessments = () => useQuery(assessmentsQuery);
/** Pools are recalculated by the backend after uploads/cancellations; refresh the cached views. */
var invalidatePooling = (qc) => Promise.all([qc.invalidateQueries({ queryKey: poolsQuery.queryKey }), qc.invalidateQueries({ queryKey: assessmentsQuery.queryKey })]);
//#endregion
export { usePools as a, useAssessments as i, invalidatePooling as n, recalculatePools as r, decidePool as t };
