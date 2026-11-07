import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

vi.mock("@tanstack/react-router", async (orig) => ({
  ...(await orig<typeof import("@tanstack/react-router")>()),
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
const { CommsDrawer } = await import("@/components/bedro/comms-drawer");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const msg = (o: object) => ({
  id: "M1",
  direction: "outbound",
  status: "accepted_by_provider",
  is_test: true,
  provider: "gmail",
  linked: true,
  negotiation_id: "N1",
  negotiation_offer_id: 1,
  from_address: null,
  to_address: "test-inbox@example.com",
  subject: "[TEST] Request for quotation",
  body_text: "<script>alert(1)</script> TEST MESSAGE",
  reference_token: "NEG-X",
  authorized_by: "negotiation_agent",
  send_attempts: 1,
  last_error: null,
  interpretation: null,
  review_reason: null,
  received_at: null,
  sent_at: "2026-10-30T10:00:00",
  created_at: "2026-10-30T10:00:00",
  ...o,
});
const conv = (o: object = {}) => ({
  negotiation_id: "N1",
  supplier_id: "SUP-0042",
  company_name: "Supplier One",
  material_name: "Test Wafer",
  subject_type: "requirement_item",
  scope_label: "R-1",
  reference: "NEG-X",
  negotiation_status: "awaiting_supplier_response",
  mode: "email_test",
  is_test: true,
  current_round: 1,
  max_rounds: 5,
  message_count: 1,
  needs_review_count: 0,
  pending_send_count: 0,
  latest_at: "2026-10-30T10:00:00+00:00",
  latest: {
    direction: "outbound",
    status: "accepted_by_provider",
    preview: "Round 1 proposal: 11 USD per unit × 500 wafers",
  },
  ...o,
});
const status = (o: object = {}) => ({
  channel: "test",
  provider: "gmail",
  test_mode: true,
  test_recipient: "test-inbox@example.com",
  send_authorization: "agent",
  message: "Development test mode",
  ...o,
});
const negDetail = {
  id: "N1",
  status: "awaiting_supplier_response",
  mode: "email_test",
  current_round: 1,
  offers: [
    {
      id: 1,
      party: "buyer",
      source: "policy",
      action: "offer",
      communication_status: "sent",
      round_number: 1,
      unit_price: 11,
      currency: "USD",
      quantity: 500,
      unit_of_measure: "wafers",
      lead_time_days: 30,
    },
  ],
};
const syncStatus = { last_run: null, last_success: null, polling_interval_seconds: 0 };

function mockApi(handler: (path: string, init: RequestInit) => Response | undefined) {
  const fn = vi.fn(async (url: string, init: RequestInit = {}) => {
    const path = new URL(url).pathname + new URL(url).search;
    const custom = handler(path, init);
    if (custom) return custom;
    if (path === "/api/v1/email/status") return json(status());
    if (path === "/api/v1/email/sync/status") return json(syncStatus);
    if (path === "/api/v1/negotiations/N1") return json(negDetail);
    return json([]);
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}
const renderDrawer = () =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <CommsDrawer open onClose={() => {}} />
      <Toaster />
    </QueryClientProvider>,
  );
const posts = (fn: ReturnType<typeof mockApi>, suffix: string) =>
  fn.mock.calls.filter(
    ([u, i]) => (i as RequestInit)?.method === "POST" && String(u).endsWith(suffix),
  );

afterEach(() => {
  vi.unstubAllGlobals();
  toast.dismiss(); // sonner keeps toasts in module state: never let one test see another's notification
});

describe("Supplier Communications", () => {
  it("lists conversations by supplier ID and shows the full thread, bodies as text", async () => {
    mockApi((path) => {
      if (path === "/api/v1/email/conversations")
        return json({
          conversations: [conv({ needs_review_count: 1, message_count: 2 })],
          unmatched_count: 0,
        });
      if (path === "/api/v1/negotiations/N1/communications")
        return json([
          msg({}),
          msg({
            id: "R1",
            direction: "inbound",
            status: "needs_review",
            linked: false,
            review_reason: "Sender is not a verified contact",
            from_address: "x@y.z",
            subject: "Re: hello",
            body_text: "We accept",
            sent_at: null,
            received_at: "2026-10-30T11:00:00",
          }),
        ]);
      return undefined;
    });
    renderDrawer();
    expect(await screen.findByText("Email: TEST MODE")).toBeInTheDocument();
    const item = await screen.findByRole("button", { name: /Supplier One/ });
    expect(within(item).getByText(/Supplier SUP-0042/)).toBeInTheDocument(); // real supplier ID, not the name
    expect(within(item).getByText("1 need review")).toBeInTheDocument();
    fireEvent.click(item);
    const thread = await screen.findByRole("list", { name: "Messages, oldest first" });
    const bubbles = within(thread).getAllByRole("article");
    expect(bubbles.map((b) => b.getAttribute("aria-label"))).toEqual([
      "Outgoing message",
      "Incoming message",
    ]);
    const [outgoing, incoming] = bubbles as [HTMLElement, HTMLElement];
    expect(within(outgoing).getByText("Accepted by provider — awaiting reply")).toBeInTheDocument();
    expect(within(outgoing).getByText("BEDRO agent")).toBeInTheDocument();
    expect(within(incoming).getByText("Not applied to the negotiation")).toBeInTheDocument();
    expect(within(incoming).getByText(/Sender is not a verified contact/)).toBeInTheDocument();
    expect(screen.getByText(/<script>alert\(1\)<\/script> TEST MESSAGE/)).toBeInTheDocument(); // text, not executed
    expect(document.querySelector("article script")).toBeNull();
    expect(await screen.findByText(/proposal was emailed/)).toBeInTheDocument();
    const summary = screen.getByRole("region", { name: "Negotiation summary" });
    expect(
      within(summary).getByText("BEDRO agent offered 11 USD per unit, 30 days · emailed"),
    ).toBeInTheDocument();
    expect(within(summary).getByText(/Next: waiting for the supplier's reply/)).toBeInTheDocument();
  });

  it("keeps separate negotiations with one supplier as separate conversations", async () => {
    mockApi((path) =>
      path === "/api/v1/email/conversations"
        ? json({
            conversations: [
              conv({ scope_label: "A" }),
              conv({ negotiation_id: "N2", scope_label: "B" }),
            ],
            unmatched_count: 1,
          })
        : undefined,
    );
    renderDrawer();
    const items = await screen.findAllByRole("button", { name: /Supplier One/ });
    expect(items).toHaveLength(2);
    expect(screen.getByText(/1 reply could not be matched/)).toBeInTheDocument();
  });

  it("reports an unconfigured email channel honestly and offers no inbox check", async () => {
    mockApi((path) =>
      path === "/api/v1/email/status"
        ? json(
            status({
              channel: "none",
              provider: "none",
              test_recipient: null,
              message: "Email is not configured.",
            }),
          )
        : path === "/api/v1/email/conversations"
          ? json({ conversations: [], unmatched_count: 0 })
          : undefined,
    );
    renderDrawer();
    expect(await screen.findByText("Email: not configured")).toBeInTheDocument();
    expect(await screen.findByText(/No supplier conversations yet/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Check inbox/ })).not.toBeInTheDocument();
  });

  it("notifies success only after the backend confirms the send", async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => (release = r));
    const fn = mockApi((path) => {
      if (path === "/api/v1/email/status") return json(status({ send_authorization: "buyer" }));
      if (path === "/api/v1/email/conversations")
        return json({ conversations: [conv({ pending_send_count: 1 })], unmatched_count: 0 });
      if (path === "/api/v1/negotiations/N1/communications")
        return json([msg({ status: "awaiting_authorization", sent_at: null })]);
      return undefined;
    });
    const base = fn.getMockImplementation()!;
    fn.mockImplementation(async (url: string, init: RequestInit = {}) => {
      // the send response is held until release()
      if (String(url).endsWith("/email/messages/M1/send")) {
        await gate;
        return json(msg({ status: "accepted_by_provider", authorized_by: "buyer" }));
      }
      return base(url, init);
    });
    renderDrawer();
    fireEvent.click(await screen.findByRole("button", { name: /Supplier One/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Send email" }));
    await waitFor(() => expect(posts(fn, "/email/messages/M1/send")).toHaveLength(1));
    expect(screen.queryByText("Test email accepted by Gmail")).not.toBeInTheDocument(); // not before confirmation
    release();
    expect(await screen.findByText("Test email accepted by Gmail")).toBeInTheDocument();
    await waitFor(() =>
      expect(
        fn.mock.calls.filter(([u]) => String(u).endsWith("/email/conversations")).length,
      ).toBeGreaterThan(1),
    ); // list refreshed without a reload
  });

  it("a failed send shows an error notification, never a success", async () => {
    mockApi((path, init) => {
      if (path === "/api/v1/email/status") return json(status({ send_authorization: "buyer" }));
      if (path === "/api/v1/email/conversations")
        return json({ conversations: [conv()], unmatched_count: 0 });
      if (path.endsWith("/send") && init.method === "POST")
        return json(
          msg({
            status: "failed",
            last_error: "Gmail rejected the message (HTTP 400)",
            sent_at: null,
          }),
        );
      if (path === "/api/v1/negotiations/N1/communications")
        return json([msg({ status: "awaiting_authorization", sent_at: null })]);
      return undefined;
    });
    renderDrawer();
    fireEvent.click(await screen.findByRole("button", { name: /Supplier One/ }));
    fireEvent.click(await screen.findByRole("button", { name: "Send email" }));
    expect(await screen.findByText("Email not sent")).toBeInTheDocument();
    expect(screen.queryByText(/accepted by Gmail/)).not.toBeInTheDocument();
  });

  it("manual inbox check works with automatic polling off and reports the counts", async () => {
    const fn = mockApi((path, init) => {
      if (path === "/api/v1/email/conversations")
        return json({ conversations: [conv()], unmatched_count: 0 });
      if (path === "/api/v1/email/sync" && init.method === "POST")
        return json({
          fetched: 2,
          new: 1,
          duplicates: 1,
          ignored: 0,
          processed: 1,
          needs_review: 0,
          late: 0,
          bounces: 0,
          error: null,
        });
      return undefined;
    });
    renderDrawer();
    expect(await screen.findByText(/Automatic checking is off/)).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("button", { name: /Check inbox/ }));
    expect(await screen.findByText("Inbox checked")).toBeInTheDocument();
    expect(screen.getByText(/1 new reply · 1 applied to negotiations/)).toBeInTheDocument();
    expect(posts(fn, "/email/sync")).toHaveLength(1);
  });
});
