import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", async (orig) => ({
  ...(await orig<typeof import("@tanstack/react-router")>()),
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
  useNavigate: () => vi.fn(),
}));

const { Route: SourcingRoute } = await import("@/routes/workspace.sourcing");
const { Route: NegotiationsRoute } = await import("@/routes/workspace.negotiations");
const { Route: DecisionRoute } = await import("@/routes/workspace.decision");

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const page = (items: unknown[]) => ({ items, total: items.length, limit: 500, offset: 0 });

const check = (c: string, status: string, detail: string, mandatory = true) => ({
  check: c,
  status,
  detail,
  mandatory,
  required: null,
  offered: null,
});
const cand = (id: string, status: string, extra: object = {}) => ({
  offering_id: id,
  supplier_id: `S-${id}`,
  company_name: `Supplier ${id}`,
  material_name: "Test Wafer",
  material_grade: "Prime",
  unit_price: "12.5000",
  currency: "USD",
  unit_of_measure: "wafers",
  minimum_order_quantity: 100,
  available_quantity: 1000,
  lead_time_days: 30,
  quality_rating: 4.5,
  country_of_origin: "Testland",
  data_source: "sample_csv",
  status,
  score: status === "eligible" ? "95.00" : null,
  score_breakdown: {},
  rank: status === "eligible" ? 1 : null,
  checks: [check("delivery_deadline", "pass", "Lead time 30 days fits")],
  limitations: [],
  ...extra,
});
const matches = {
  shortlist: [cand("O1", "eligible")],
  eligible: [cand("O1", "eligible")],
  needs_review: [
    cand("O2", "needs_review", {
      checks: [check("available_quantity", "unknown", "Available quantity not listed")],
    }),
  ],
  ineligible: [],
  other_category_offerings: 0,
  ranking: { weights: { price: "0.50" }, factors_used: ["price"], note: null },
  active_negotiation_id: null,
  context: {
    quantity: "500.0000",
    unit_of_measure: "wafers",
    budget_per_unit: "15.0000",
    currency: "USD",
    deadline: "2026-12-14",
    budget_note: null,
  },
};
const offer = (o: object) => ({
  id: 1,
  round_number: 1,
  party: "buyer",
  source: "policy",
  action: "offer",
  simulated: false,
  unit_price: 11,
  currency: "USD",
  quantity: 500,
  unit_of_measure: "wafers",
  lead_time_days: 30,
  quoted_total: 5500,
  message: "m",
  rationale: "Opening offer",
  llm_status: "not_used",
  communication_status: "not_sent",
  verification: null,
  ...o,
});
const negotiation = (o: object) => ({
  id: "N1",
  status: "awaiting_supplier_response",
  mode: "live",
  simulated: false,
  subject_type: "requirement_item",
  subject_id: "I1",
  material_name: "Test Wafer",
  quantity: 500,
  unit_of_measure: "wafers",
  currency: "USD",
  supplier_id: "S-O1",
  company_name: "Supplier O1",
  offering_id: "O1",
  current_round: 1,
  max_rounds: 5,
  latest_unit_price: 11,
  updated_at: "2026-10-30T10:00:00Z",
  selection_method: "buyer",
  selection_reason: "Selected by the buyer",
  list_unit_price: 12.5,
  budget_per_unit: 15,
  target_unit_price: 11,
  ceiling_unit_price: 13.5,
  recommendation: null,
  final_offer_id: null,
  offers: [offer({})],
  decision: null,
  allowed_actions: ["cancel"],
  notices: ["No supplier has been contacted"],
  context: { allocations: [] },
  ...o,
});

function mockApi(handler: (path: string, init: RequestInit) => Response) {
  const fn = vi.fn(async (url: string, init: RequestInit = {}) =>
    handler(new URL(url).pathname, init),
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}
function renderRoute(route: { options: { component?: unknown } }) {
  const Page = route.options.component as () => ReactNode;
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <Page />
    </QueryClientProvider>,
  );
}
const reqData = (path: string) =>
  path.endsWith("/items")
    ? json(
        page([
          {
            id: "I1",
            batch_id: "B1",
            row_number: 2,
            status: "validated",
            source_requirement_id: "R-1",
            component_category: "Silicon Wafers",
            material_name: "Test Wafer",
            technical_specification: null,
            required_quantity: 500,
            unit_of_measure: "wafers",
            maximum_budget_per_unit: 15,
            currency: "USD",
            required_delivery_days: 45,
          },
        ]),
      )
    : json(
        page([
          {
            id: "B1",
            original_filename: "b.csv",
            file_type: "csv",
            file_size_bytes: 1,
            status: "ready",
            total_rows: 1,
            imported_rows: 1,
            rejected_rows: 0,
            unmapped_columns: [],
            uploaded_at: "2026-10-30T10:00:00Z",
            cancelled_at: null,
          },
        ]),
      );

afterEach(() => vi.unstubAllGlobals());

describe("Sourcing Options", () => {
  const selection = (offeringId: string) => ({
    item_id: "I1",
    request_id: "B1",
    offering_id: offeringId,
    supplier_id: `S-${offeringId}`,
    company_name: `Supplier ${offeringId}`,
    selected_at: "2026-10-31T10:00:00Z",
    updated_at: "2026-10-31T10:00:00Z",
    eligible: true,
    reason: null,
  });
  const withAlt = {
    ...matches,
    request_id: "B1",
    eligible: [cand("O1", "eligible"), cand("O3", "eligible", { rank: 4, score: "70.00" })],
  };
  function selectionApi(opts: { putStatus?: number } = {}) {
    const calls: { method: string; path: string; body: unknown }[] = [];
    const fn = mockApi((path, init) => {
      const method = init.method ?? "GET";
      if (method !== "GET")
        calls.push({ method, path, body: init.body ? JSON.parse(init.body as string) : null });
      if (path.endsWith("/supplier-matches")) return json(withAlt);
      if (path.endsWith("/supplier-selection") && method === "PUT") {
        const b = JSON.parse(init.body as string);
        return opts.putStatus
          ? json(
              {
                error: {
                  code: "supplier_not_selectable",
                  message: "cannot be selected: it is not eligible",
                },
              },
              opts.putStatus,
            )
          : json(selection(b.offering_id));
      }
      if (path === "/api/v1/negotiations" && method === "POST") return json(negotiation({}), 201);
      if (path.startsWith("/api/v1/demand-pools")) return json(page([]));
      return reqData(path);
    });
    return { fn, calls };
  }

  it("persists the selected supplier with request, offering and supplier ids — without starting a negotiation", async () => {
    const { calls } = selectionApi();
    renderRoute(SourcingRoute);
    fireEvent.click(await screen.findByRole("button", { name: /Supplier O3/ })); // an eligible alternative outside the shortlist
    expect(await screen.findByText("Selected Supplier")).toBeInTheDocument();
    expect(calls).toEqual([
      {
        method: "PUT",
        path: "/api/v1/requirement-items/I1/supplier-selection",
        body: { request_id: "B1", offering_id: "O3", supplier_id: "S-O3" },
      },
    ]);
    expect(screen.getByText("Agent recommended")).toBeInTheDocument(); // recommendation stays distinguishable
    expect(screen.getByRole("button", { name: /Supplier O1/ })).toBeInTheDocument(); // alternatives kept
  });

  it("shows the backend's reason when an offering cannot be selected", async () => {
    selectionApi({ putStatus: 422 });
    renderRoute(SourcingRoute);
    fireEvent.click(await screen.findByRole("button", { name: /Supplier O3/ }));
    expect(await screen.findByText(/cannot be selected: it is not eligible/)).toBeInTheDocument();
    expect(screen.queryByText("Selected Supplier")).not.toBeInTheDocument();
  });

  it("shows the backend shortlist and starts ONE negotiation sending only identifiers", async () => {
    const fn = mockApi((path, init) => {
      if (path.endsWith("/supplier-matches")) return json({ ...matches, request_id: "B1" });
      if (path.endsWith("/supplier-selection")) return json(selection("O1"));
      if (path === "/api/v1/negotiations" && init.method === "POST")
        return json(negotiation({}), 201);
      if (path.startsWith("/api/v1/demand-pools")) return json(page([]));
      return reqData(path);
    });
    renderRoute(SourcingRoute);
    fireEvent.click(await screen.findByRole("button", { name: /Supplier O1/ }));
    expect(screen.queryByRole("button", { name: /Supplier O2/ })).not.toBeInTheDocument(); // needs-review is not selectable
    await screen.findByText("Selected Supplier");
    fireEvent.click(
      screen.getByRole("button", { name: "Start Negotiation with Selected Supplier" }),
    );
    await waitFor(() =>
      expect(fn.mock.calls.some(([, i]) => (i as RequestInit)?.method === "POST")).toBe(true),
    );
    const [, init] = fn.mock.calls.find(([, i]) => (i as RequestInit)?.method === "POST")!;
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({
      subject_type: "requirement_item",
      subject_id: "I1",
      offering_id: "O1",
    });
  });
});

describe("Sourcing Options — negotiation scope", () => {
  const items = (ids: string[]) =>
    page(
      ids.map((id, n) => ({
        id,
        batch_id: "B1",
        row_number: n + 2,
        status: "validated",
        source_requirement_id: `R-${id}`,
        component_category: "Silicon Wafers",
        material_name: `Wafer ${id}`,
        technical_specification: null,
        required_quantity: 500,
        unit_of_measure: "wafers",
        maximum_budget_per_unit: 15,
        currency: "USD",
        required_delivery_days: 45,
      })),
    );
  const api = (onPost: (body: unknown) => void, extra: object = {}) =>
    mockApi((path, init) => {
      if (path.endsWith("/supplier-matches")) return json({ ...matches, ...extra });
      if (path === "/api/v1/negotiations" && init.method === "POST") {
        onPost(JSON.parse(init.body as string));
        return json(negotiation({}), 201);
      }
      if (path.startsWith("/api/v1/demand-pools")) return json(page([]));
      if (path.includes("/items")) return json(items(["IA", "IB"]));
      return reqData(path);
    });

  it("selects nothing by default when there are several items, then negotiates only the clicked one", async () => {
    const bodies: unknown[] = [];
    api((b) => bodies.push(b));
    renderRoute(SourcingRoute);
    expect(await screen.findByText(/Select a line item or pool on the left/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Let the agent choose/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("option", { name: /Wafer IB/ }));
    expect(await screen.findByText(/Applies to item “Wafer IB” only/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Let the agent choose/ }));
    await waitFor(() => expect(bodies).toHaveLength(1));
    expect(bodies[0]).toEqual({
      subject_type: "requirement_item",
      subject_id: "IB",
      auto_select: true,
    });
  });

  it("does not offer a start while the demand is covered by another active negotiation", async () => {
    api(() => {}, { overlapping_negotiation_id: "N-POOL" });
    renderRoute(SourcingRoute);
    fireEvent.click(await screen.findByRole("option", { name: /Wafer IA/ }));
    expect(await screen.findByText(/already being negotiated inside a pool/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Let the agent choose/ })).not.toBeInTheDocument();
  });
});

describe("Negotiations (procurement requests)", () => {
  const counts = {
    not_started: 1,
    active: 1,
    pending_review: 0,
    completed: 0,
    unresolved: 0,
    cancelled: 0,
  };
  const reqSummary = {
    id: "B1",
    request_ref: "PR-2026-001",
    original_filename: "plan.csv",
    uploaded_at: "2026-10-30T10:00:00Z",
    batch_status: "ready",
    total_requirements: 2,
    rejected_rows: 0,
    counts,
    status: "in_progress",
  };
  const row = (o: object = {}) => ({
    negotiation_id: "N1",
    status: "awaiting_supplier_response",
    mode: "live",
    pooled: false,
    supplier_id: "S-O1",
    supplier_name: "Supplier O1",
    registered_email: "sales@o1.example",
    email_problem: null,
    send_problem: null,
    offering_id: "O1",
    currency: "USD",
    current_price: 11,
    current_round: 1,
    max_rounds: 5,
    reference: "NEG-1",
    latest_response: null,
    message_count: 1,
    last_activity: "2026-10-30T10:00:00Z",
    can_cancel: true,
    awaiting_buyer_decision: false,
    ...o,
  });
  const reqDetail = (n: object = {}) => ({
    ...reqSummary,
    requirements: [
      {
        id: "I1",
        requirement_id: "R-1",
        row_number: 2,
        item_name: "Test Wafer",
        component_category: "Silicon Wafers",
        material_grade: "Prime",
        quantity: 500,
        unit: "wafers",
        budget_per_unit: 15,
        currency: "USD",
        required_delivery_days: 45,
        status: "active",
        negotiation_count: 1,
        negotiations: [row(n)],
      },
      {
        id: "I2",
        requirement_id: "R-2",
        row_number: 3,
        item_name: "Other Wafer",
        component_category: "Silicon Wafers",
        material_grade: null,
        quantity: 10,
        unit: "wafers",
        budget_per_unit: null,
        currency: null,
        required_delivery_days: null,
        status: "not_started",
        negotiation_count: 0,
        negotiations: [],
      },
    ],
  });
  const api = (n: object, detail: object = {}, onPost?: (path: string, body: unknown) => unknown) =>
    mockApi((path, init) => {
      if (init.method === "POST") {
        const body = init.body ? JSON.parse(init.body as string) : undefined;
        return json(onPost?.(path, body) ?? n);
      }
      if (path === "/api/v1/procurement-requests") return json([reqSummary]);
      if (path === "/api/v1/procurement-requests/B1") return json(reqDetail(detail));
      return json(n);
    });
  async function openSupplierRow() {
    fireEvent.click(await screen.findByRole("button", { name: /PR-2026-001/ }));
    fireEvent.click(await screen.findByRole("button", { name: /R-1 · Test Wafer/ }));
    return screen.findByLabelText("Negotiation with Supplier O1");
  }

  it("shows requests, then requirements, then supplier negotiations with their facts", async () => {
    api(negotiation({}));
    renderRoute(NegotiationsRoute);
    expect(await screen.findByText(/plan.csv/)).toBeInTheDocument();
    expect(screen.getByText(/2 requirements · 1 active · 1 not started/)).toBeInTheDocument();
    await openSupplierRow();
    expect(screen.getByText("sales@o1.example")).toBeInTheDocument();
    expect(screen.getByText("No supplier response yet")).toBeInTheDocument();
    expect(screen.getByText(/R-2 · Other Wafer/)).toBeInTheDocument(); // requirements without negotiations are listed
  });

  it("request-level Negotiate Using Agent posts only the request id and shows the backend summary", async () => {
    const calls: [string, unknown][] = [];
    api(negotiation({}), {}, (path, body) => {
      calls.push([path, body]);
      return {
        request_id: "B1",
        request_ref: "PR-2026-001",
        processed: 2,
        summary: { started: 1, active: 0, skipped: 0, failed: 1 },
        results: [
          {
            item_id: "I2",
            requirement_id: "R-2",
            item_name: "Other Wafer",
            outcome: "failed",
            reason: "Not started: supplier has no registered email",
            negotiation_id: null,
            supplier_id: null,
            email_status: null,
          },
        ],
        request: reqDetail(),
      };
    });
    renderRoute(NegotiationsRoute);
    fireEvent.click(await screen.findByRole("button", { name: "Negotiate Using Agent" }));
    expect(
      await screen.findByText(/1 started, 0 already active, 0 skipped, 1 failed/),
    ).toBeInTheDocument();
    expect(screen.getByText(/supplier has no registered email/)).toBeInTheDocument();
    expect(calls).toEqual([["/api/v1/procurement-requests/B1/negotiate", {}]]);
  });

  it("cancels only the one supplier negotiation", async () => {
    const calls: string[] = [];
    api(negotiation({}), {}, (path) => (calls.push(path), negotiation({ status: "cancelled" })));
    renderRoute(NegotiationsRoute);
    await openSupplierRow();
    fireEvent.click(screen.getByRole("button", { name: "Cancel this supplier negotiation" }));
    await waitFor(() => expect(calls).toEqual(["/api/v1/negotiations/N1/cancel"]));
  });

  it("live negotiations wait for a real reply instead of offering a fake step", async () => {
    api(negotiation({}));
    renderRoute(NegotiationsRoute);
    await openSupplierRow();
    fireEvent.click(screen.getByRole("button", { name: "Rounds & offers" }));
    expect(await screen.findByText(/Waiting for the supplier's real reply/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Run next round/ })).not.toBeInTheDocument();
    expect(screen.getByText("Proposal recorded — not sent")).toBeInTheDocument();
  });

  it("simulated rounds are labelled and advance with the expected round", async () => {
    const sim = negotiation({
      mode: "simulated",
      simulated: true,
      allowed_actions: ["advance", "cancel"],
      offers: [
        offer({}),
        offer({
          id: 2,
          party: "supplier",
          source: "simulated_supplier",
          simulated: true,
          action: "counteroffer",
          unit_price: 12.3,
          rationale: "[SIMULATED SUPPLIER] Counteroffers",
        }),
      ],
    });
    const fn = api(sim, { mode: "simulated" });
    renderRoute(NegotiationsRoute);
    await openSupplierRow();
    fireEvent.click(screen.getByRole("button", { name: "Rounds & offers" }));
    expect((await screen.findAllByText("Simulated")).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: "Run next round (simulated)" }));
    await waitFor(() =>
      expect(
        fn.mock.calls.some(
          ([u, i]) => (i as RequestInit)?.method === "POST" && u.endsWith("/N1/advance"),
        ),
      ).toBe(true),
    );
    const [, init] = fn.mock.calls.find(([u]) => u.endsWith("/advance"))!;
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({ expected_round: 1 });
  });
});

describe("Sourcing Decision", () => {
  const verified = offer({
    id: 9,
    party: "supplier",
    action: "accept",
    unit_price: 12,
    verification: {
      status: "verified",
      computed_total: 6000,
      checks: [check("budget", "pass", "Unit price is within the buyer budget")],
    },
  });

  it("offers accept only for a verified final offer and posts an explicit decision", async () => {
    const n = negotiation({
      status: "awaiting_buyer_decision",
      final_offer_id: 9,
      offers: [verified],
      allowed_actions: ["accept", "reject", "cancel"],
    });
    const fn = mockApi((path, init) =>
      init.method === "POST"
        ? json({ ...n, status: "accepted_by_buyer" })
        : path === "/api/v1/negotiations"
          ? json(page([n]))
          : json(n),
    );
    renderRoute(DecisionRoute);
    expect(await screen.findByText("Unit price is within the buyer budget")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Accept Offer" }));
    await waitFor(() =>
      expect(
        fn.mock.calls.some(
          ([u, i]) => (i as RequestInit)?.method === "POST" && u.endsWith("/N1/decision"),
        ),
      ).toBe(true),
    );
    const [, init] = fn.mock.calls.find(([u]) => u.endsWith("/decision"))!;
    expect(JSON.parse((init as RequestInit).body as string)).toEqual({ decision: "accept" });
  });

  it("does not offer acceptance when the offer needs manual review", async () => {
    const review = {
      ...verified,
      verification: {
        status: "needs_review",
        computed_total: 6000,
        checks: [check("budget", "unknown", "No buyer budget")],
      },
    };
    const n = negotiation({
      status: "manual_review_required",
      final_offer_id: 9,
      offers: [review],
      allowed_actions: ["reject", "cancel"],
    });
    mockApi((path) => (path === "/api/v1/negotiations" ? json(page([n])) : json(n)));
    renderRoute(DecisionRoute);
    expect(await screen.findByText("Manual review required")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Accept Offer" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Decline Offer" })).toBeInTheDocument();
  });
});
