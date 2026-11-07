import { queryOptions, useQuery } from "@tanstack/react-query";
import { fetchAllPages as fetchAll } from "./api";
import type { Supplier, SupplierOffering } from "./types";

type SupplierDto = Omit<Supplier, "capabilities" | "offerings"> & {
  manufacturing_capabilities: string[];
  chip_model_reference: string | null;
};
export type Catalog = { suppliers: Supplier[]; offerings: SupplierOffering[] };

/** Supplier catalogue from the backend supplier database. Throws ApiError on failure — never falls back to fake data. */
export async function fetchCatalog(signal?: AbortSignal): Promise<Catalog> {
  const [supplierDtos, offerings] = await Promise.all([
    fetchAll<SupplierDto>("/suppliers", signal),
    fetchAll<SupplierOffering>("/offerings", signal),
  ]);
  const suppliers = supplierDtos.map(
    ({ manufacturing_capabilities, chip_model_reference: _, ...s }): Supplier => ({
      ...s,
      capabilities: manufacturing_capabilities,
      offerings: offerings.filter((o) => o.supplier_id === s.supplier_id),
    }),
  );
  return { suppliers, offerings };
}

export const catalogQuery = queryOptions({
  queryKey: ["supplier-catalog"],
  queryFn: ({ signal }) => fetchCatalog(signal),
  staleTime: 5 * 60_000,
  retry: 1,
});

export const useCatalog = () => useQuery(catalogQuery);

/** True when any record comes from the seeded sample CSV, so the UI can label it as sample data. */
export const isSampleData = (c: Catalog) =>
  c.suppliers.some((s) => s.data_source === "sample_csv") ||
  c.offerings.some((o) => o.data_source === "sample_csv");
