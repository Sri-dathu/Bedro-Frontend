import { Database } from "lucide-react";
import type { Catalog } from "@/services/catalog";
import { ErrorNotice, LoadingNotice } from "./query-notice";

export type CatalogStatus = "pending" | "error" | "empty" | "ready";

export const catalogStatus = (q: {
  isPending: boolean;
  isError: boolean;
  data?: Catalog | undefined;
}): CatalogStatus =>
  q.isPending
    ? "pending"
    : q.isError || !q.data
      ? "error"
      : q.data.offerings.length === 0
        ? "empty"
        : "ready";

/** Loading / error / empty states for the API-backed supplier catalogue. Never renders placeholder suppliers. */
export function CatalogNotice({
  status,
  error,
  onRetry,
}: {
  status: Exclude<CatalogStatus, "ready">;
  error?: unknown;
  onRetry?: () => void;
}) {
  if (status === "pending") return <LoadingNotice>Loading supplier catalogue…</LoadingNotice>;
  if (status === "empty")
    return (
      <p role="status" className="flex items-start gap-2 text-sm text-muted-foreground">
        <Database className="mt-0.5 size-4 shrink-0" />
        The supplier database is empty. Run the supplier import on the backend to load the
        catalogue.
      </p>
    );
  return (
    <ErrorNotice
      title="Supplier catalogue unavailable."
      error={error}
      suffix="No supplier data is shown."
      {...(onRetry ? { onRetry } : {})}
    />
  );
}
