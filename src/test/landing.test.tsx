import { act, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", async (orig) => ({
  ...(await orig<typeof import("@tanstack/react-router")>()),
  Link: ({ children, to, className }: { children: ReactNode; to: string; className?: string }) => (
    <a href={to} className={className}>{children}</a>
  ),
}));
// jsdom has no WebGL: stand in for the animated background, keep the real hero around it.
vi.mock("@/components/MicroSlats", () => ({ default: () => <div data-testid="micro-slats" /> }));

// Capture every IntersectionObserver so the test can fire "section scrolled into view" callbacks.
const observers: { cb: IntersectionObserverCallback; targets: Element[] }[] = [];
class FakeIO {
  targets: Element[] = [];
  constructor(public cb: IntersectionObserverCallback) { observers.push(this); }
  observe(el: Element) { this.targets.push(el); }
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
vi.stubGlobal("IntersectionObserver", FakeIO);

const { Route } = await import("@/routes/index");
const Landing = Route.options.component!;

describe("Landing navigation", () => {
  it("links the four sections in order, without Product or Request access, and opens the workspace", () => {
    const { container } = render(<Landing />);
    const nav = screen.getAllByRole("navigation", { name: "Site" })[0]!;
    const items = Array.from(nav.querySelectorAll("a, button")).map((i) => i.textContent);  // document order
    expect(items).toEqual(["Intelligence engines", "Procurement workspace", "How it works", "FAQ"]);
    expect(screen.queryByText(/Request access/i)).toBeNull();
    expect(container.querySelector("#product, #access")).toBeNull();
    for (const id of ["engines", "workspace", "how", "faq"]) expect(container.querySelector(`#${id}`)).not.toBeNull();
    expect(container.querySelector("header a[href='/workspace']")).toHaveTextContent("Open Workspace");
    const ctas = screen.getAllByRole("link", { name: /Open Procurement Workspace/ });  // section + footer
    expect(ctas.length).toBeGreaterThan(0);
    for (const a of ctas) expect(a).toHaveAttribute("href", "/workspace");
  });

  it("never changes the selected option while scrolling", () => {
    const { container } = render(<Landing />);
    const header = container.querySelector("header")!;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      for (const o of observers) {  // every section "scrolls into view"
        const entries = o.targets.map((target) => ({
          target, isIntersecting: true, intersectionRatio: 1, boundingClientRect: target.getBoundingClientRect(),
        })) as unknown as IntersectionObserverEntry[];
        o.cb(entries, o as unknown as IntersectionObserver);
      }
    });
    expect(header.querySelectorAll("[aria-current]")).toHaveLength(0);
    expect(header.querySelector(".glass-segment-active")).toBeNull();
  });

  it("keeps the hero and navbar design", async () => {
    const { container } = render(<Landing />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/BUY.*LIKE.*AN.*ENTERPRISE/);
    expect(container.querySelector("header .glass-nav")).not.toBeNull();
    expect(container.querySelector(".hero .hero-background")).not.toBeNull();
    expect(await screen.findByTestId("micro-slats")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore the Procurement Workspace/ })).toHaveAttribute("href", "/workspace");
  });
});
