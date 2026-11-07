/** Frontend data contracts. Catalogue types mirror the backend API (GET /api/v1/offerings, /suppliers). */
/** One supplier listing. null = not provided by the source data (never defaulted). unit_price is indicative, not a quote. */
export type SupplierOffering = {
  offering_id: string; supplier_id: string; company_name: string;
  component_category: string; material_name: string; material_grade: string | null;
  specification: string | null; unit_of_measure: string | null; minimum_order_quantity: number | null;
  unit_price: number; currency: string; lead_time_days: number | null; available_quantity: number | null;
  quality_rating: number | null; quality_certification: string | null; delivery_reliability_pct: number | null;
  country_of_origin: string | null; compliance_status: string | null; counterfeit_risk_level: string | null;
  process_node_nm: string | null; node_size_nm: number | null; chip_category: string | null;
  application: string | null; memory_type: string | null; memory_technology: string | null;
  target_hardware: string | null; last_updated: string | null; data_source: string;
};

export type Supplier = {
  supplier_id: string; company_name: string; company_type: string | null; country: string | null;
  certifications: string[]; capabilities: string[]; fabrication_ownership: string | null;
  offering_count: number; data_source: string; offerings: SupplierOffering[];
};

export type ItemStatus = "Valid" | "Needs Review";

/** One persisted requirement row (backend item id). Only valid rows become items; rejected rows stay on the batch. */
export type RequirementItem = {
  id: string; batchId: string; rowNumber: number;
  part: string; category: string; quantity: number | null; unit: string;
  targetPrice: number | null; currency: string | null; requiredLeadDays: number | null; specification: string;
  sourceRequirementId: string | null; issues: string[]; status: ItemStatus;
};

/** ready = all rows valid · needs_review = some rows rejected · failed = no valid rows · cancelled = removed */
export type BatchStatus = "ready" | "needs_review" | "failed" | "cancelled";

export type RequirementBatch = {
  id: string; fileName: string; uploadedAt: string; status: BatchStatus;
  totalRows: number; importedRows: number; rejectedRows: number;
  itemIds: string[]; unmappedColumns: string[];
};

export type RowError = { rowNumber: number; errors: { field: string; message: string }[]; rawData: Record<string, unknown> };

// Negotiation, offer and decision types live in services/negotiations.ts (backend contract).

export type ActivityEvent = { id: string; at: string; text: string; simulated?: boolean };
