import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { UploadCloud, Trash2, FileUp, FileSpreadsheet, X, ChevronDown, AlertTriangle, CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Empty, PageHeader, Pill } from "@/components/bedro/ui";
import { ErrorNotice, LoadingNotice, describeApiError } from "@/components/bedro/query-notice";
import { actions } from "@/services/store";
import { invalidatePooling } from "@/services/pooling";
import {
  ACCEPTED, cancelBatch, fetchBatchDetail, precheckFile, requirementsQuery, uploadRequirementFile, useRequirements,
  type BatchDetail,
} from "@/services/requirements";
import type { BatchStatus, RequirementBatch, RequirementItem } from "@/services/types";

export const Route = createFileRoute("/workspace/requirements")({ component: Requirements });

/** A file selected in the browser but not yet submitted. Lives only in component state. */
type Draft = { key: string; file: File; error: string | null; uploading: boolean };

const STATUS: Record<BatchStatus, { label: string; tone: "success" | "warning" | "danger" | "neutral" }> = {
  ready: { label: "Ready", tone: "success" },
  needs_review: { label: "Needs review", tone: "warning" },
  failed: { label: "No valid rows", tone: "danger" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};
const kb = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

function Requirements() {
  const qc = useQueryClient();
  const req = useRequirements();
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [results, setResults] = useState<BatchDetail[]>([]); // uploads confirmed by the backend this session
  const [toCancel, setToCancel] = useState<RequirementBatch | null>(null);

  function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const added = Array.from(files).map((file) => ({ key: crypto.randomUUID(), file, error: precheckFile(file), uploading: false }));
    setDrafts((d) => [...d, ...added]);
    if (input.current) input.current.value = ""; // allow re-selecting the same file
  }

  /** A. Local removal: drops the unsubmitted file from browser state only. No backend call. */
  const removeDraft = (key: string) => setDrafts((d) => d.filter((x) => x.key !== key));
  const patchDraft = (key: string, p: Partial<Draft>) => setDrafts((d) => d.map((x) => (x.key === key ? { ...x, ...p } : x)));

  async function upload(draft: Draft) {
    patchDraft(draft.key, { uploading: true, error: null });
    try {
      const res = await uploadRequirementFile(draft.file);
      removeDraft(draft.key);
      setResults((r) => [res, ...r]);
      actions.note(`Uploaded ${res.batch.fileName} — ${res.batch.importedRows} of ${res.batch.totalRows} rows imported`);
      await Promise.all([qc.invalidateQueries({ queryKey: requirementsQuery.queryKey }), invalidatePooling(qc)]);
    } catch (e) {
      patchDraft(draft.key, { uploading: false, error: describeApiError(e) }); // file stays selected so it can be fixed/retried
    }
  }

  const uploadAll = () => drafts.filter((d) => !d.uploading && !precheckFile(d.file)).forEach(upload);
  const sessionIds = new Set(results.map((r) => r.batch.id));
  const batches = req.data?.batches ?? [];
  const fresh = batches.filter((b) => sessionIds.has(b.id));
  const earlier = batches.filter((b) => !sessionIds.has(b.id));
  const busy = drafts.some((d) => d.uploading);

  return (
    <>
      <PageHeader title="Requirements" description="Upload buyer requirement files. Files are validated and stored by the backend; each upload becomes its own batch and each valid row its own requirement item." />
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); addFiles(e.dataTransfer.files); }}
        className={`surface flex flex-col items-center border-2 border-dashed px-6 py-10 text-center transition ${drag ? "border-primary bg-accent" : ""}`}>
        <UploadCloud className="size-8 text-primary" />
        <p className="mt-3 font-semibold">Drag and drop requirement files</p>
        <p className="mt-1 text-sm text-muted-foreground">CSV or XLSX · up to 5 MB · required columns: material_name, component_category, required_quantity, unit_of_measure</p>
        <Button className="mt-5" onClick={() => input.current?.click()}>Select Files</Button>
        <input ref={input} type="file" accept={ACCEPTED} multiple hidden data-testid="file-input" onChange={(e) => addFiles(e.target.files)} />
      </div>

      {drafts.length > 0 && (
        <section className="surface mt-4 p-4" aria-label="Selected files">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Selected files — not uploaded yet</h2>
            {drafts.length > 1 && <Button size="sm" disabled={busy || drafts.every((d) => !!precheckFile(d.file))} onClick={uploadAll}>Upload all</Button>}
          </div>
          <ul className="mt-3 divide-y">
            {drafts.map((d) => (
              <li key={d.key} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                <FileSpreadsheet className="size-4 text-muted-foreground" />
                <span className="mr-auto min-w-0">
                  <span className="font-medium">{d.file.name}</span> <span className="text-muted-foreground">· {kb(d.file.size)}</span>
                  {d.error && <span role="alert" className="mt-1 block text-xs text-destructive">{d.error}</span>}
                </span>
                {d.uploading ? <Pill tone="primary">Uploading…</Pill> : <>
                  <Button size="sm" variant="outline" disabled={!!precheckFile(d.file)} onClick={() => upload(d)}>Upload</Button>
                  <Button size="sm" variant="ghost" aria-label={`Remove ${d.file.name} from selection`} onClick={() => removeDraft(d.key)}><X className="size-4" />Remove</Button>
                </>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((r) => <UploadOutcome key={r.batch.id} result={r} />)}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {req.isPending && <LoadingNotice>Loading requirement batches…</LoadingNotice>}
        {req.isError && <ErrorNotice title="Requirement batches unavailable." error={req.error} onRetry={() => req.refetch()} />}
        {req.isSuccess && batches.length === 0 && <Empty icon={<FileUp className="size-5" />} title="No requirement batches" body="Uploaded batches appear here with validation results for each line item." />}
        {fresh.length > 0 && <BatchGroup title="Uploaded this session" batches={fresh} items={req.data!.items} onCancel={setToCancel} />}
        {earlier.length > 0 && <BatchGroup title={fresh.length ? "Earlier batches" : "Batches"} batches={earlier} items={req.data!.items} onCancel={setToCancel} />}
      </div>

      <CancelDialog batch={toCancel} onClose={() => setToCancel(null)} />
    </>
  );
}

function UploadOutcome({ result: { batch: b, possibleDuplicateOf } }: { result: BatchDetail }) {
  const ok = b.status === "ready";
  return (
    <div role="status" className={`flex items-start gap-2 rounded-xl p-3 text-sm ${ok ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
      {ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0" />}
      <span>
        <span className="font-semibold">{b.fileName}</span> saved as batch {b.id.slice(0, 8)} — {b.importedRows} of {b.totalRows} rows imported
        {b.rejectedRows > 0 && `, ${b.rejectedRows} rejected (see the batch below)`}.
        {possibleDuplicateOf.length > 0 && <span className="block text-xs"><Copy className="mr-1 inline size-3" />Identical content to {possibleDuplicateOf.length} earlier batch(es). It was kept as a separate batch; remove it if it was uploaded by mistake.</span>}
      </span>
    </div>
  );
}

function BatchGroup({ title, batches, items, onCancel }: { title: string; batches: RequirementBatch[]; items: Record<string, RequirementItem>; onCancel: (b: RequirementBatch) => void }) {
  return (
    <div>
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="space-y-6">{batches.map((b) => <BatchCard key={b.id} batch={b} items={b.itemIds.map((id) => items[id]).filter((x): x is RequirementItem => !!x)} onCancel={onCancel} />)}</div>
    </div>
  );
}

function BatchCard({ batch: b, items, onCancel }: { batch: RequirementBatch; items: RequirementItem[]; onCancel: (b: RequirementBatch) => void }) {
  const [showRejected, setShowRejected] = useState(false);
  const s = STATUS[b.status];
  return (
    <section className="surface overflow-hidden" aria-label={`Batch ${b.fileName}`}>
      <div className="flex flex-wrap items-center gap-3 border-b p-4">
        <div className="mr-auto min-w-0">
          <div className="font-semibold">{b.fileName}</div>
          <div className="text-xs text-muted-foreground">Batch {b.id} · {new Date(b.uploadedAt).toLocaleString()}{b.unmappedColumns.length > 0 && ` · Unmapped columns kept as extra attributes: ${b.unmappedColumns.join(", ")}`}</div>
        </div>
        <Pill tone={s.tone}>{s.label}</Pill>
        <Pill tone="success">{b.importedRows} imported</Pill>
        {b.rejectedRows > 0 && <Pill tone="warning">{b.rejectedRows} rejected</Pill>}
        <Button variant="ghost" size="sm" onClick={() => onCancel(b)}><Trash2 className="size-4" />Remove batch</Button>
      </div>
      {items.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>{["Row", "Ref", "Part", "Category", "Qty", "Max budget / unit", "Delivery", "Status"].map((h) => <th key={h} className="px-4 py-2.5 font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y">
              {items.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.rowNumber}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.sourceRequirementId ?? "—"}</td>
                  <td className="px-4 py-2.5 font-medium">{r.part}</td>
                  <td className="px-4 py-2.5">{r.category}</td>
                  <td className="px-4 py-2.5">{r.quantity?.toLocaleString() ?? "—"} {r.unit}</td>
                  <td className="px-4 py-2.5">{r.targetPrice !== null ? `${r.targetPrice} ${r.currency ?? ""}` : "—"}</td>
                  <td className="px-4 py-2.5">{r.requiredLeadDays !== null ? `${r.requiredLeadDays} d` : "—"}</td>
                  <td className="px-4 py-2.5"><Pill tone="success">Valid</Pill></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {b.rejectedRows > 0 && (
        <div className="border-t p-4">
          <button className="flex items-center gap-1.5 text-sm font-medium text-warning" aria-expanded={showRejected} onClick={() => setShowRejected((v) => !v)}>
            <ChevronDown className={`size-4 transition ${showRejected ? "rotate-180" : ""}`} />{showRejected ? "Hide" : "Show"} {b.rejectedRows} rejected row{b.rejectedRows > 1 ? "s" : ""}
          </button>
          {showRejected && <RejectedRows batchId={b.id} />}
        </div>
      )}
    </section>
  );
}

function RejectedRows({ batchId }: { batchId: string }) {
  const q = useQuery({ queryKey: ["requirement-batch", batchId], queryFn: ({ signal }) => fetchBatchDetail(batchId, signal) });
  if (q.isPending) return <div className="mt-3"><LoadingNotice>Loading validation results…</LoadingNotice></div>;
  if (q.isError) return <div className="mt-3"><ErrorNotice title="Validation results unavailable." error={q.error} onRetry={() => q.refetch()} /></div>;
  return (
    <ul className="mt-3 space-y-2 text-sm">
      {q.data.rowErrors.map((e) => (
        <li key={e.rowNumber} className="rounded-lg bg-warning/10 px-3 py-2">
          <span className="font-semibold">Row {e.rowNumber}:</span> {e.errors.map((x) => `${x.field} — ${x.message}`).join("; ")}
        </li>
      ))}
    </ul>
  );
}

/** B. Submitted-batch removal: explicit backend cancel, confirmed first; the list refreshes only after success. */
function CancelDialog({ batch, onClose }: { batch: RequirementBatch | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function confirm() {
    if (!batch) return;
    setBusy(true); setError(null);
    try {
      await cancelBatch(batch.id);
      actions.note(`Removed batch ${batch.fileName}`);
      await Promise.all([qc.invalidateQueries({ queryKey: requirementsQuery.queryKey }), invalidatePooling(qc)]);
      onClose();
    } catch (e) {
      setError(describeApiError(e)); // batch stays listed; nothing changed
    } finally { setBusy(false); }
  }
  return (
    <AlertDialog open={!!batch} onOpenChange={(o) => { if (!o && !busy) { setError(null); onClose(); } }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove batch “{batch?.fileName}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Its {batch?.importedRows ?? 0} requirement item(s) will be withdrawn from sourcing. The batch is cancelled rather than deleted, so its records are kept for traceability. Other batches are not affected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && <p role="alert" className="text-sm text-destructive">Could not remove the batch: {error}</p>}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Keep batch</AlertDialogCancel>
          <Button variant="destructive" disabled={busy} onClick={confirm}>{busy ? "Removing…" : "Remove batch"}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
