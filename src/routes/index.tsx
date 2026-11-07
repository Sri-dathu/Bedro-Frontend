import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";
import { Hero } from "@/components/bedro/hero";
import { BrandWordmark } from "@/components/bedro/brand-wordmark";
import { EASE } from "@/components/bedro/glass";
import { scrollToSection as go } from "@/components/bedro/landing/motion";
import { WorkspaceShowcase } from "@/components/bedro/landing/workspace-showcase";
import { HowItWorks } from "@/components/bedro/landing/how-it-works";
import { Faq } from "@/components/bedro/landing/faq";
import { SiteFooter } from "@/components/bedro/landing/site-footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BEDRO — Autonomous Procurement for Semiconductors" },
      { name: "description", content: "Pool purchasing power, discover qualified alternatives, and negotiate on your terms." },
      { property: "og:title", content: "BEDRO — Autonomous Procurement for Semiconductors" },
      { property: "og:description", content: "Pool purchasing power, discover qualified alternatives, and negotiate on your terms." },
    ],
  }),
  component: Landing,
});

// Section links scroll to their section; the workspace itself is the primary action (right-hand button).
// There is deliberately no scroll-driven "active" state: scrolling never changes the selected option.
const NAV = [
  ["INTELLIGENCE ENGINES", "engines"], ["PROCUREMENT WORKSPACE", "workspace"], ["HOW IT WORKS", "how"], ["FAQ", "faq"],
] as const;

const label = (l: string) => (l === "FAQ" ? l : l.charAt(0) + l.slice(1).toLowerCase());

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onDesktop = () => desktop.matches && setOpen(false);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    desktop.addEventListener("change", onDesktop);
    return () => { window.removeEventListener("scroll", onScroll); desktop.removeEventListener("change", onDesktop); };
  }, []);
  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus(); // return focus to the control that opened the menu
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
    return (
    <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}
      className="fixed inset-x-0 top-3 z-50 px-3 sm:top-4">
      <div className={`glass-nav mx-auto flex h-14 max-w-6xl items-center gap-3 rounded-2xl pl-4 pr-2 sm:h-16 sm:pl-5 ${scrolled ? "shadow-elegant" : ""}`}>
        <a href="#top" aria-label="BEDRO — back to top" className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span aria-hidden className="grid size-7 grid-cols-2 gap-0.75 rounded-lg bg-gradient-primary p-1.25 shadow-elegant">
            {[0, 1, 2, 3].map((i) => <span key={i} className={`rounded-[2px] bg-primary-foreground ${i === 1 ? "opacity-60" : "opacity-95"}`} />)}
          </span>
          <BrandWordmark />
        </a>
        <nav aria-label="Site" className="mx-auto hidden items-center gap-0.5 lg:flex">
          {NAV.map(([l, id]) => (
            <button key={id} type="button" onClick={() => go(id)} className="nav-link">{label(l)}</button>
          ))}
        </nav>
        <Link to="/workspace"
          className="ml-auto hidden h-10 items-center gap-1.5 rounded-xl bg-gradient-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-elegant outline-none transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-glow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:ml-0 lg:inline-flex">
          Open Workspace <ArrowRight className="size-3.5" />
        </Link>
        <button ref={toggleRef} type="button" className="ml-auto grid size-10 place-items-center rounded-xl text-foreground outline-none transition-colors hover:bg-card/70 focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="landing-menu" onClick={() => setOpen(!open)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div id="landing-menu" ref={menuRef} initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ duration: 0.22, ease: EASE }}
            className="glass-nav mx-auto mt-2 max-w-6xl origin-top rounded-2xl p-2 lg:hidden">
            <nav aria-label="Site" className="flex flex-col">
              
              {NAV.map(([l, id]) => (
                <button key={id} type="button" onClick={() => { setOpen(false); go(id); }}
                  className={`rounded-xl px-4 py-3 text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
                    "hover:bg-card/70"}`}>
                  {label(l)}
                </button>
              ))}
              <Link to="/workspace" onClick={() => setOpen(false)}
                className="mt-1 rounded-xl bg-gradient-primary px-4 py-3 text-left text-sm font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">
                Open Procurement Workspace
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function Landing() {
  return (
    // Respect prefers-reduced-motion for every framer-motion animation on the page.
    <MotionConfig reducedMotion="user">
      <div id="top" className="bg-background">
        <Nav />
        <main>
          <Hero go={go} />
          <WorkspaceShowcase />
          <HowItWorks />
          <Faq />
        </main>
        <SiteFooter sections={NAV.map(([l, id]) => [label(l), id] as const)} go={go} />
      </div>
    </MotionConfig>
  );
}
