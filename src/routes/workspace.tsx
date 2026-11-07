import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { activitySignature, conversationsQuery, unseenAttention, type Conversations } from "@/services/email";
import { invalidateNegotiations } from "@/services/negotiations";
import { actions, useStore } from "@/services/store";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, FileUp, Layers, Search, Handshake, CheckCircle2, Menu, X, Mail } from "lucide-react";
import { CommsDrawer } from "@/components/bedro/comms-drawer";
import { Toaster } from "@/components/ui/sonner";
import { SPRING, EASE } from "@/components/bedro/glass";

export const Route = createFileRoute("/workspace")({
  head: () => ({
    meta: [
      { title: "Procurement Workspace — BEDRO" },
      { name: "description", content: "Upload requirements, compare shortlisted suppliers, negotiate and decide." },
      { property: "og:title", content: "Procurement Workspace — BEDRO" },
      { property: "og:description", content: "Upload requirements, compare shortlisted suppliers, negotiate and decide." },
    ],
  }),
  component: WorkspaceLayout,
});

const NAV = [
  { to: "/workspace", label: "Overview", icon: LayoutDashboard },
  { to: "/workspace/requirements", label: "Requirements", icon: FileUp },
  { to: "/workspace/pooling", label: "Demand Pooling", icon: Layers },
  { to: "/workspace/sourcing", label: "Sourcing Options", icon: Search },
  { to: "/workspace/negotiations", label: "Negotiations", icon: Handshake },
  { to: "/workspace/decision", label: "Sourcing Decision", icon: CheckCircle2 },
] as const;

function NavList({ onNav }: { onNav?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = to === "/workspace" ? path === "/workspace" || path === "/workspace/" : path.startsWith(to);
        return (
          <Link key={to} to={to} onClick={onNav}
            className={`group relative flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium outline-none transition-[color,background-color,transform] duration-200 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring ${active ? "font-semibold text-accent-foreground" : "text-muted-foreground hover:bg-card/70 hover:text-foreground"}`}>
            {active && <motion.span layoutId="nav-active" className="glass-segment-active absolute inset-0 rounded-full" transition={SPRING} />}
            <Icon className={`relative size-4 transition-transform duration-200 ${active ? "text-primary" : "group-hover:translate-x-0.5"}`} />
            <span className="relative">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** The backend advances negotiations by itself (inbox polling, agent replies, outcome emails). When any
 *  conversation shows new activity, refresh every view derived from negotiations so pages stay consistent. */
function useBackendActivitySync(data: Conversations | undefined) {
  const qc = useQueryClient();
  const last = useRef<string | null>(null);
  const sig = data ? data.conversations.map(activitySignature).sort().join(";") : null;
  useEffect(() => {
    if (sig === null) return;
    if (last.current !== null && last.current !== sig) void invalidateNegotiations(qc);
    last.current = sig;
  }, [sig, qc]);
}

function WorkspaceLayout() {
  const [mobile, setMobile] = useState(false);
  const comms = useStore((s) => s.comms);
  const path = useRouterState({ select: (s) => s.location.pathname });
  // Badge: conversations needing attention (review, unsent email, offer awaiting the buyer, unmatched replies) that
  // changed since the buyer last opened Supplier Communications. Opening the drawer clears it until new activity.
  const convs = useQuery({ ...conversationsQuery, refetchInterval: 30_000 });
  useBackendActivitySync(convs.data);
  const seen = useStore((s) => s.seen);
  const attention = unseenAttention(convs.data, seen);
  return (
    <div className="min-h-screen bg-background bg-gradient-hero">
      <aside className="glass fixed inset-y-3 left-3 z-30 hidden w-60 flex-col rounded-3xl p-4 lg:flex">
        <Link to="/" className="mb-8 px-2 font-display text-xl font-bold tracking-tight">BEDRO<span className="text-primary">.</span></Link>
        <NavList />
        <div className="mt-auto rounded-2xl bg-secondary p-3 text-xs text-muted-foreground">Development build. Service status is shown on the Overview and in Supplier Communications.</div>
      </aside>
      <header className="glass sticky top-0 z-20 flex h-16 items-center gap-3 px-4 lg:ml-[264px] lg:mr-3 lg:mt-3 lg:rounded-2xl">
        <button className="rounded-lg p-2 hover:bg-secondary lg:hidden" aria-label="Open navigation" onClick={() => setMobile(true)}><Menu className="size-5" /></button>
        <span className="font-display font-bold lg:hidden">BEDRO</span>
        <span className="hidden text-sm text-muted-foreground lg:block">Procurement Workspace</span>
        <button onClick={() => actions.openComms()} aria-label={`Supplier Communications${attention ? ` (${attention} need attention)` : ""}`} className="glass-capsule relative ml-auto grid size-10 place-items-center rounded-full text-muted-foreground transition hover:text-foreground active:scale-95 focus-visible:ring-2 focus-visible:ring-ring outline-none">
          <Mail className="size-5" />
          {attention > 0 && <span aria-hidden className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">{attention}</span>}
        </button>
      </header>
      <AnimatePresence>
        {mobile && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-foreground/10 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobile(false)} />
            <motion.aside className="glass fixed inset-y-0 left-0 z-50 w-72 p-4 lg:hidden" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}>
              <div className="mb-6 flex items-center justify-between px-2"><span className="font-display text-xl font-bold">BEDRO</span>
                <button aria-label="Close navigation" onClick={() => setMobile(false)} className="rounded-lg p-2 hover:bg-secondary"><X className="size-4" /></button></div>
              <NavList onNav={() => setMobile(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <main className="px-4 py-8 lg:ml-[264px] lg:px-8">
        <motion.div key={path} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="mx-auto max-w-6xl">
          <Outlet />
        </motion.div>
      </main>
      <CommsDrawer open={comms.open} initialNegotiationId={comms.negotiationId} onClose={actions.closeComms} />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
