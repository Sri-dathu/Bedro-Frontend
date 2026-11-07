import { ErrorNotice, LoadingNotice } from "@/components/bedro/query-notice";
import { sourcingBreakdown, useRequests } from "@/services/procurement";

const pct = (v: number, total: number) => (total ? Math.round((v / total) * 100) : 0);

/** Overview analytics: this workspace's procurement requirements by sourcing stage. Live from the backend
 *  (GET /procurement-requests); nothing here is hardcoded. The React Bits Pro Analytics 5 donut
 *  (@reactbits-pro/analytics-5) mounts in the chart slot with `segments` as its data and `total` as its center. */
export function ProcurementAnalytics() {
  const requests = useRequests();
  const { total, segments } = sourcingBreakdown(requests.data ?? []);

  return (
    <section className="surface p-5" aria-labelledby="analytics-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="analytics-title" className="font-semibold">Analytics</h2>
        <span className="text-xs text-muted-foreground">Procurement requirements by sourcing stage</span>
      </div>
      {requests.isPending ? <div className="mt-4"><LoadingNotice>Loading procurement analytics…</LoadingNotice></div>
      : requests.isError ? <div className="mt-4"><ErrorNotice title="Analytics unavailable." error={requests.error} onRetry={() => requests.refetch()} /></div>
      : (
        <div className="mt-4 grid items-center gap-6 sm:grid-cols-[minmax(0,14rem)_1fr]">
          <div className="text-center sm:text-left" data-chart-slot="analytics-5">
            <div className="font-display text-4xl font-semibold tabular-nums" aria-label={`${total} procurement requirements`}>{total.toLocaleString()}</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total requirements</div>
            {total === 0 && <p className="mt-2 text-xs text-muted-foreground">No active requirements yet — upload a requirement file to start sourcing.</p>}
          </div>
          <ul className="space-y-2.5 text-sm" aria-label="Requirements by sourcing stage">
            {segments.map((s) => (
              <li key={s.key} className="flex items-center gap-3" title={`${s.label}: ${s.value} of ${total} (${pct(s.value, total)}%) — ${s.description}`}>
                <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                <span className="min-w-0 flex-1 truncate">{s.label}</span>
                <span className="font-medium tabular-nums">{s.value.toLocaleString()}</span>
                <span className="w-10 text-right text-xs tabular-nums text-muted-foreground">{pct(s.value, total)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
