import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, PageHeader, Pill, Stat } from "@/components/bedro/ui";
import { CatalogNotice, catalogStatus } from "@/components/bedro/catalog-notice";
import { ErrorNotice, LoadingNotice } from "@/components/bedro/query-notice";
import { ProcurementAnalytics } from "@/components/bedro/procurement-analytics";
import { apiRequest } from "@/services/api";
import { STATUS_LABEL, countByStage, useNegotiations } from "@/services/negotiations";
import { isSampleData, useCatalog } from "@/services/catalog";
import { useRequirements } from "@/services/requirements";
import { getBackendReadiness } from "@/services/health";
import { usePools } from "@/services/pooling";
import { conversationsQuery, emailStatusQuery, syncStatusQuery, toDate } from "@/services/email";

export const Route = createFileRoute("/workspace/")({ component: Overview });

type Tone = "neutral" | "success" | "warning" | "danger";

function Overview() {
  const req = useRequirements();
  const batches = req.data?.batches ?? [];
  const items = Object.values(req.data?.items ?? {});
  const pools = usePools();
  const catalog = useCatalog();
  const cStatus = catalogStatus(catalog);
  const readiness = useQuery({ queryKey: ["backend-readiness"], queryFn: ({ signal }) => getBackendReadiness(signal), retry: false, refetchInterval: 30_000 });
  const rejected = batches.reduce((n, b) => n + b.rejectedRows, 0);
  const negs = useNegotiations();
  const negList = negs.data ?? [];
  // Counts come from the canonical stage of each persisted status (services/negotiations STAGE).
  const stages = negs.data ? countByStage(negList) : null;
  const recent = [...negList].sort((a, b) => toDate(b.updated_at).getTime() - toDate(a.updated_at).getTime()).slice(0, 6);
  const convs = useQuery({ ...conversationsQuery, refetchInterval: 30_000 });
  const reviewCount = (convs.data?.conversations ?? []).reduce((n, c) => n + c.needs_review_count, 0) + (convs.data?.unmatched_count ?? 0);
  const integ = useQuery({ queryKey: ["integrations-status"], queryFn: ({ signal }) => apiRequest<{ llm: { configured: boolean; enabled: boolean }; simulation_mode: string }>("/integrations/status", { signal }), retry: false });
  const email = useQuery({ ...emailStatusQuery, refetchInterval: 60_000 });
  const sync = useQuery({ ...syncStatusQuery, refetchInterval: 30_000 });
  const e = email.data, ps = e?.provider_status, lastRun = sync.data?.last_run;
  // Email: "Connected" only when the backend verified the provider (read-only Gmail profile request) and the
  // authorised mailbox is the configured sender — never just because settings or a token file exist.
  const emailRow: { status: string; tone: Tone } = email.isPending ? { status: "Checking…", tone: "neutral" }
    : !e ? { status: "Unknown", tone: "neutral" }
    : e.channel === "none" ? { status: "Not configured", tone: "danger" }
    : e.provider === "mock" ? { status: "Mock (simulated)", tone: "warning" }
    : ps?.state === "authorization_required" || ps?.configured === false ? { status: "Authorization required", tone: "danger" }
    : ps?.state === "connection_failed" ? { status: "Connection failed", tone: "danger" }
    : ps?.problem ? { status: "Wrong Gmail account", tone: "danger" }
    : ps?.state !== "connected" ? { status: "Not verified", tone: "warning" }
    : e.channel === "disabled" ? { status: "Connected · sending disabled", tone: "warning" }
    : { status: e.channel === "test" ? "Connected · Gmail test mode" : "Connected · Gmail live", tone: "success" };
  const repliesRow: { status: string; tone: Tone } = integ.data?.simulation_mode === "demo" ? { status: "Simulated (demo)", tone: "warning" }
    : !e ? { status: "Unknown", tone: "neutral" }
    : e.channel !== "test" && e.channel !== "production" ? { status: "No email channel", tone: "danger" }
    : !sync.data ? { status: "Unknown", tone: "neutral" }
    : lastRun?.status === "error" ? { status: "Last check failed", tone: "danger" }
    : lastRun ? { status: `Checked ${toDate(lastRun.finished_at ?? lastRun.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`, tone: "success" }
    : { status: "Not checked yet", tone: "neutral" };
  // Live checks only — a service is shown as connected only when the backend actually answered.
  const live: { name: string; status: string; tone: Tone }[] = [
    { name: "Backend API", ...(readiness.isPending ? { status: "Checking…", tone: "neutral" } : readiness.data?.status === "ready" ? { status: "Connected", tone: "success" } : readiness.data ? { status: "Not Ready", tone: "warning" } : { status: "Unreachable", tone: "danger" }) },
    { name: "Supplier database", ...(cStatus === "pending" ? { status: "Checking…", tone: "neutral" } : cStatus === "error" ? { status: "Unavailable", tone: "danger" } : { status: "Connected", tone: "success" }) },
    { name: "Negotiation agent", ...(!integ.data ? { status: "Unknown", tone: "neutral" } : integ.data.llm.configured && integ.data.llm.enabled ? { status: "Rules + LLM key set", tone: "success" } : { status: "Rules only (no LLM key)", tone: "warning" }) },
    { name: "Supplier email service", ...emailRow },
    { name: "Supplier replies", ...repliesRow },
  ];
  const notes = [ps?.problem, ps?.state !== "connected" ? ps?.detail : null, lastRun?.status === "error" ? `Last inbox check failed: ${lastRun.error}` : null].filter(Boolean);
  return (
    <>
      <PageHeader title="Overview" description="Status of your requirement batches, negotiations and sourcing decisions." />
      {req.isPending ? <LoadingNotice>Loading requirements…</LoadingNotice>
      : req.isError ? <ErrorNotice title="Requirements unavailable." error={req.error} onRetry={() => req.refetch()} />
      : batches.length === 0 ? (
        <Empty icon={<FileUp className="size-5" />} title="No requirements uploaded" body="Upload a CSV or XLSX requirement file to begin validation, supplier matching and shortlisting."
          action={<Button asChild><Link to="/workspace/requirements">Upload Requirements</Link></Button>} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Requirement batches" value={batches.length} hint={`${items.length} line items · ${rejected} rejected rows`} />
            <Stat label="Negotiating" value={negs.data ? stages!.negotiating : "—"} hint={negs.data ? `${negList.length} negotiations in total` : "Negotiations unavailable"} />
            <Stat label="Awaiting your approval" value={negs.data ? stages!.awaiting_approval : "—"} hint={negs.data ? `${stages!.needs_review} need manual review` : "Negotiations unavailable"} />
            <Stat label="Agreed (approved by you)" value={negs.data ? stages!.concluded_success : "—"} hint={negs.data ? `${stages!.concluded_no_deal} closed without agreement` : "Negotiations unavailable"} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Supplier replies to review" value={convs.data ? reviewCount : "—"} hint={convs.data ? "Replies the agent did not act on" : "Conversations unavailable"} />
            <Stat label="Confirmed demand pools" value={pools.data ? pools.data.length : "—"} hint={!pools.data ? "Demand pools unavailable" : pools.data.some((p) => p.approval_status === "pending") ? `${pools.data.filter((p) => p.approval_status === "pending").length} awaiting your approval` : "Compatible demand sourced together"} />
          </div>
        </>
      )}
      {negs.data && negList.length > 0 && (
        <div className="surface mt-6 p-5">
          <h2 className="font-semibold">Recent negotiation outcomes</h2>
          <ul className="mt-3 divide-y">
            {recent.map((n) => (
              <li key={n.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <span className="min-w-0 truncate">{n.company_name} · {n.material_name}</span>
                <span className="flex items-center gap-2">
                  <Pill tone={STATUS_LABEL[n.status].tone}>{STATUS_LABEL[n.status].label}</Pill>
                  <span className="text-xs text-muted-foreground">{toDate(n.updated_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2"><ProcurementAnalytics /></div>
        <div className="space-y-4">
          <div className="surface p-5">
            <h2 className="font-semibold">Integration status</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {live.map((i) => <li key={i.name} className="flex justify-between gap-2"><span>{i.name}</span><Pill tone={i.tone}>{i.status}</Pill></li>)}
            </ul>
            {notes.map((n) => <p key={n} role="alert" className="mt-3 text-xs text-destructive">{n}</p>)}
            {sync.data?.polling_interval_seconds === 0 && e && (e.channel === "test" || e.channel === "production") && <p className="mt-3 text-xs text-muted-foreground">Replies are read when you click “Check inbox” in Supplier Communications (automatic checking is off).</p>}
          </div>
          <div className="surface p-5">
            <div className="flex items-center justify-between"><h2 className="font-semibold">Supplier catalogue</h2>{catalog.data && isSampleData(catalog.data) && <Pill>Sample data</Pill>}</div>
            {cStatus !== "ready" ? <div className="mt-3"><CatalogNotice status={cStatus} error={catalog.error} onRetry={() => catalog.refetch()} /></div> : <>
              <p className="mt-2 text-sm text-muted-foreground">{catalog.data!.suppliers.length} suppliers · {catalog.data!.offerings.length} offerings</p>
              <ul className="mt-3 space-y-1 text-sm">{catalog.data!.suppliers.map((x) => <li key={x.supplier_id} className="flex justify-between"><span className="truncate">{x.company_name}</span><span className="text-muted-foreground">{x.offerings.length}</span></li>)}</ul>
            </>}
          </div>
        </div>
      </div>
    </>
  );
}
