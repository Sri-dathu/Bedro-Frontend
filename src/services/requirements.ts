import { queryOptions, useQuery } from "@tanstack/react-query";
import { apiRequest, fetchAllPages } from "./api";
import type { BatchStatus, RequirementBatch, RequirementItem, RowError } from "./types";

/** Buyer requirement files are parsed and validated by the backend; the browser only pre-checks type and size. */
export const ACCEPTED = ".csv,.xlsx";
export const MAX_BYTES = 5 * 1024 * 1024;

type BatchDto = {
  id: string;
  original_filename: string;
  file_type: string;
  file_size_bytes: number;
  status: BatchStatus;
  total_rows: number;
  imported_rows: number;
  rejected_rows: number;
  unmapped_columns: string[];
  uploaded_at: string;
  cancelled_at: string | null;
};
type BatchDetailDto = BatchDto & {
  column_mapping: Record<string, string>;
  row_errors: {
    row_number: number;
    errors: { field: string; message: string }[];
    raw_data: Record<string, unknown>;
  }[];
  possible_duplicate_of: string[];
};
type ItemDto = {
  id: string;
  batch_id: string;
  row_number: number;
  status: string;
  source_requirement_id: string | null;
  component_category: string;
  material_name: string;
  technical_specification: string | null;
  required_quantity: number;
  unit_of_measure: string;
  maximum_budget_per_unit: number | null;
  currency: string | null;
  required_delivery_days: number | null;
};

export type BatchDetail = {
  batch: RequirementBatch;
  rowErrors: RowError[];
  possibleDuplicateOf: string[];
};
export type Requirements = { batches: RequirementBatch[]; items: Record<string, RequirementItem> };

const toBatch = (d: BatchDto, itemIds: string[] = []): RequirementBatch => ({
  id: d.id,
  fileName: d.original_filename,
  uploadedAt: d.uploaded_at,
  status: d.status,
  totalRows: d.total_rows,
  importedRows: d.imported_rows,
  rejectedRows: d.rejected_rows,
  itemIds,
  unmappedColumns: d.unmapped_columns,
});

const toDetail = (d: BatchDetailDto): BatchDetail => ({
  batch: toBatch(d),
  rowErrors: d.row_errors.map((e) => ({
    rowNumber: e.row_number,
    errors: e.errors,
    rawData: e.raw_data,
  })),
  possibleDuplicateOf: d.possible_duplicate_of,
});

const toItem = (d: ItemDto): RequirementItem => ({
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
  status: "Valid", // only valid rows are stored as items
});

/** Quick browser-side check before sending; the backend repeats every check authoritatively. */
export function precheckFile(file: File): string | null {
  if (!/\.(csv|xlsx)$/i.test(file.name)) return "Only .csv and .xlsx files are supported.";
  if (file.size > MAX_BYTES) return "File exceeds the 5 MB limit.";
  if (file.size === 0) return "The file is empty.";
  return null;
}

/** One idempotency key per selected File object: retrying the same selection never creates a second request. */
const uploadKeys = new WeakMap<File, string>();

/** Uploads one file. The backend always creates a new, separate batch (procurement request), or rejects the file
 *  with an ApiError; a retry of the same selected file returns the request the first attempt created. */
export async function uploadRequirementFile(
  file: File,
  signal?: AbortSignal,
): Promise<BatchDetail> {
  const body = new FormData();
  body.append("file", file, file.name);
  let key = uploadKeys.get(file);
  if (!key) uploadKeys.set(file, (key = crypto.randomUUID()));
  return toDetail(
    await apiRequest<BatchDetailDto>("/requirement-batches", {
      method: "POST",
      body,
      timeoutMs: 60_000,
      headers: { "Idempotency-Key": key },
      ...(signal ? { signal } : {}),
    }),
  );
}

/** All active (non-cancelled) batches with their items, from the backend. */
export async function fetchRequirements(signal?: AbortSignal): Promise<Requirements> {
  const batchDtos = await fetchAllPages<BatchDto>("/requirement-batches", signal);
  const perBatch = await Promise.all(
    batchDtos.map((b) =>
      b.imported_rows
        ? fetchAllPages<ItemDto>(`/requirement-batches/${encodeURIComponent(b.id)}/items`, signal)
        : [],
    ),
  );
  const items: Record<string, RequirementItem> = {};
  const batches = batchDtos.map((b, i) => {
    const its = perBatch[i]!.map(toItem);
    its.forEach((it) => (items[it.id] = it));
    return toBatch(
      b,
      its.map((it) => it.id),
    );
  });
  return { batches, items };
}

export async function fetchBatchDetail(
  batchId: string,
  signal?: AbortSignal,
): Promise<BatchDetail> {
  return toDetail(
    await apiRequest<BatchDetailDto>(
      `/requirement-batches/${encodeURIComponent(batchId)}`,
      signal ? { signal } : {},
    ),
  );
}

/** Removes a submitted batch from active use (backend marks it cancelled; records are kept). */
export async function cancelBatch(batchId: string): Promise<RequirementBatch> {
  return toBatch(
    await apiRequest<BatchDto>(`/requirement-batches/${encodeURIComponent(batchId)}/cancel`, {
      method: "POST",
    }),
  );
}

export const requirementsQuery = queryOptions({
  queryKey: ["requirements"],
  queryFn: ({ signal }) => fetchRequirements(signal),
  retry: 1,
});

export const useRequirements = () => useQuery(requirementsQuery);
