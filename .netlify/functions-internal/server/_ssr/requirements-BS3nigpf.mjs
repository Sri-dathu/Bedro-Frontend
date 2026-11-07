import { n as useQuery, t as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { p as fetchAllPages, u as apiRequest } from "./query-notice-CfqlvxHB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/requirements-BS3nigpf.js
/** Buyer requirement files are parsed and validated by the backend; the browser only pre-checks type and size. */
var ACCEPTED = ".csv,.xlsx";
var toBatch = (d, itemIds = []) => ({
	id: d.id,
	fileName: d.original_filename,
	uploadedAt: d.uploaded_at,
	status: d.status,
	totalRows: d.total_rows,
	importedRows: d.imported_rows,
	rejectedRows: d.rejected_rows,
	itemIds,
	unmappedColumns: d.unmapped_columns
});
var toDetail = (d) => ({
	batch: toBatch(d),
	rowErrors: d.row_errors.map((e) => ({
		rowNumber: e.row_number,
		errors: e.errors,
		rawData: e.raw_data
	})),
	possibleDuplicateOf: d.possible_duplicate_of
});
var toItem = (d) => ({
	id: d.id,
	batchId: d.batch_id,
	rowNumber: d.row_number,
	part: d.material_name,
	category: d.component_category,
	quantity: d.required_quantity,
	unit: d.unit_of_measure,
	targetPrice: d.maximum_budget_per_unit,
	currency: d.currency,
	requiredLeadDays: d.required_delivery_days,
	specification: d.technical_specification ?? "",
	sourceRequirementId: d.source_requirement_id,
	issues: [],
	status: "Valid"
});
/** Quick browser-side check before sending; the backend repeats every check authoritatively. */
function precheckFile(file) {
	if (!/\.(csv|xlsx)$/i.test(file.name)) return "Only .csv and .xlsx files are supported.";
	if (file.size > 5242880) return "File exceeds the 5 MB limit.";
	if (file.size === 0) return "The file is empty.";
	return null;
}
/** One idempotency key per selected File object: retrying the same selection never creates a second request. */
var uploadKeys = /* @__PURE__ */ new WeakMap();
/** Uploads one file. The backend always creates a new, separate batch (procurement request), or rejects the file
*  with an ApiError; a retry of the same selected file returns the request the first attempt created. */
async function uploadRequirementFile(file, signal) {
	const body = new FormData();
	body.append("file", file, file.name);
	let key = uploadKeys.get(file);
	if (!key) uploadKeys.set(file, key = crypto.randomUUID());
	return toDetail(await apiRequest("/requirement-batches", {
		method: "POST",
		body,
		timeoutMs: 6e4,
		headers: { "Idempotency-Key": key },
		...signal ? { signal } : {}
	}));
}
/** All active (non-cancelled) batches with their items, from the backend. */
async function fetchRequirements(signal) {
	const batchDtos = await fetchAllPages("/requirement-batches", signal);
	const perBatch = await Promise.all(batchDtos.map((b) => b.imported_rows ? fetchAllPages(`/requirement-batches/${encodeURIComponent(b.id)}/items`, signal) : []));
	const items = {};
	return {
		batches: batchDtos.map((b, i) => {
			const its = perBatch[i].map(toItem);
			its.forEach((it) => items[it.id] = it);
			return toBatch(b, its.map((it) => it.id));
		}),
		items
	};
}
async function fetchBatchDetail(batchId, signal) {
	return toDetail(await apiRequest(`/requirement-batches/${encodeURIComponent(batchId)}`, signal ? { signal } : {}));
}
/** Removes a submitted batch from active use (backend marks it cancelled; records are kept). */
async function cancelBatch(batchId) {
	return toBatch(await apiRequest(`/requirement-batches/${encodeURIComponent(batchId)}/cancel`, { method: "POST" }));
}
var requirementsQuery = queryOptions({
	queryKey: ["requirements"],
	queryFn: ({ signal }) => fetchRequirements(signal),
	retry: 1
});
var useRequirements = () => useQuery(requirementsQuery);
//#endregion
export { requirementsQuery as a, precheckFile as i, cancelBatch as n, uploadRequirementFile as o, fetchBatchDetail as r, useRequirements as s, ACCEPTED as t };
