import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/workspace.pooling";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const page = (items: unknown[]) => ({ items, total: items.length, limit: 500, offset: 0 });

const pool = {
  id: "P1234567-x",
  status: "confirmed",
  component_category: "Silicon Wafers",
  material_name: "Test Wafer",
  unit_of_measure: "wafers",
  technical_specification: "300 mm",
  aggregate_quantity: 6250,
  member_count: 2,
  earliest_deadline: "2026-12-14",
  latest_deadline: "2026-12-29",
  last_recalculated_at: "2026-10-30T10:00:00Z",
  approval_status: "pending",
  approval_decided_at: null,
  approval_note: null,
  constraints: {
    minimum_quality_rating: 4.6,
    required_certifications: ["ISO 9001"],
    compliance_requirements: [],
    substitution_allowed: false,
  },
  members: [
    {
      item_id: "I1",
      batch_id: "B1",
      batch_filename: "a.csv",
      row_number: 2,
      source_requirement_id: "A-1",
      buyer_company_name: null,
      requested_quantity: 5000,
      allocated_quantity: 5000,
      unit_of_measure: "wafers",
      delivery_deadline: "2026-12-14",
      active: true,
      removed_at: null,
      removal_reason: null,
    },
    {
      item_id: "I2",
      batch_id: "B2",
      batch_filename: "b.csv",
      row_number: 2,
      source_requirement_id: "B-1",
      buyer_company_name: null,
      requested_quantity: 1250,
      allocated_quantity: 1250,
      unit_of_measure: "wafers",
      delivery_deadline: "2026-12-29",
      active: true,
      removed_at: null,
      removal_reason: null,
    },
  ],
};
const assessment = (item_id: string, outcome: string, reasons: string[]) => ({
  item_id,
  batch_id: "B3",
  batch_filename: "c.csv",
  row_number: 4,
  source_requirement_id: "C-1",
  component_category: "Silicon Wafers",
  material_name: "Other Wafer",
  required_quantity: 10,
  unit_of_measure: "wafers",
  outcome,
  pool_id: null,
  reasons,
  delivery_deadline: null,
});

function mockApi(handler: (url: string, init: RequestInit) => Response) {
  const fn = vi.fn(async (url: string, init: RequestInit = {}) => handler(url, init));
  vi.stubGlobal("fetch", fn);
  return fn;
}
function renderPage() {
  const Page = Route.options.component!;
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <Page />
    </QueryClientProvider>,
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("Demand Pooling page", () => {
  it("shows confirmed pools with traceable members and explains unpooled items", async () => {
    mockApi((url) => {
      const path = new URL(url).pathname;
      if (path.endsWith("/item-assessments"))
        return json(
          page([
            assessment("I1", "pooled", []),
            assessment("I3", "needs_clarification", [
              "technical specification is missing — required before this item can be pooled",
            ]),
            assessment("I9", "excluded", ["cancelled"]),
          ]),
        );
      if (path.endsWith("/demand-pools")) return json(page([{ ...pool, members: undefined }]));
      return json(pool);
    });
    renderPage();
    const card = await screen.findByRole("region", { name: "Pool Test Wafer" });
    expect(within(card).getByText("6,250")).toBeInTheDocument();
    expect(within(card).getByText(/a\.csv · row 2 · A-1/)).toBeInTheDocument();
    expect(within(card).getByText(/b\.csv · row 2 · B-1/)).toBeInTheDocument();
    expect(within(card).getByText(/quality ≥ 4.6/)).toBeInTheDocument();
    expect(screen.getByText("Needs clarification")).toBeInTheDocument();
    expect(screen.getByText(/technical specification is missing/)).toBeInTheDocument();
    expect(screen.queryByText("Excluded")).not.toBeInTheDocument(); // cancelled items are not listed as open work
    expect(screen.getByText("Not pooled (1)")).toBeInTheDocument();
  });

  it("shows pooled volume and your share, with other companies' demand anonymised", async () => {
    const other = {
      ...pool.members[1]!,
      item_id: null,
      batch_id: null,
      batch_filename: "Other buyer (anonymised)",
      row_number: null,
      source_requirement_id: null,
      own: false,
    };
    const shared = {
      ...pool,
      own_member_count: 1,
      own_quantity: 5000,
      members: [{ ...pool.members[0]!, own: true }, other],
    };
    mockApi((url) => {
      const path = new URL(url).pathname;
      if (path.endsWith("/item-assessments")) return json(page([assessment("I1", "pooled", [])]));
      if (path.endsWith("/demand-pools")) return json(page([{ ...shared, members: undefined }]));
      return json(shared);
    });
    renderPage();
    const card = await screen.findByRole("region", { name: "Pool Test Wafer" });
    expect(within(card).getByText("Other buyer (anonymised)")).toBeInTheDocument();
    expect(within(card).queryByText(/b\.csv/)).not.toBeInTheDocument();
    expect(within(card).getByText(/your share 5,000 wafers \(1 of 2 items\)/)).toBeInTheDocument();
    expect(screen.getByText("Sourcing opportunities")).toBeInTheDocument();
    expect(screen.getByText("6,250 wafers")).toBeInTheDocument();
    expect(screen.getByText("Your share: 5,000 wafers")).toBeInTheDocument();
  });

  it("shows the backend failure instead of fabricated pools", async () => {
    mockApi(() =>
      json(
        {
          error: {
            code: "internal_error",
            message: "An unexpected error occurred.",
            details: null,
          },
        },
        500,
      ),
    );
    renderPage();
    // the pools query retries once before reporting failure
    expect(await screen.findByRole("alert", {}, { timeout: 5000 })).toHaveTextContent(
      "Demand pools unavailable",
    );
  });

  it("holds a pending pool back and lets the buyer approve or reject it", async () => {
    let approval = "pending";
    const fn = mockApi((url, init) => {
      const path = new URL(url).pathname;
      if (init.method === "POST" && path.endsWith("/approve")) approval = "approved";
      if (path.endsWith("/item-assessments")) return json(page([assessment("I1", "pooled", [])]));
      if (path.endsWith("/demand-pools"))
        return json(page([{ ...pool, approval_status: approval, members: undefined }]));
      return json({ ...pool, approval_status: approval });
    });
    renderPage();
    const card = await screen.findByRole("region", { name: "Pool Test Wafer" });
    expect(within(card).getByText("Awaiting your approval")).toBeInTheDocument();
    expect(screen.getByText(/1 pool needs your decision/)).toBeInTheDocument();
    expect(
      within(card).getByRole("button", { name: /Reject — source individually/ }),
    ).toBeInTheDocument();
    fireEvent.click(within(card).getByRole("button", { name: /Approve pooling/ }));
    await waitFor(() =>
      expect(
        within(screen.getByRole("region", { name: "Pool Test Wafer" })).getByText("Approved"),
      ).toBeInTheDocument(),
    );
    expect(
      fn.mock.calls.some(
        ([u, i]) =>
          (i as RequestInit)?.method === "POST" && u.endsWith("/demand-pools/P1234567-x/approve"),
      ),
    ).toBe(true);
    expect(screen.queryByText(/needs your decision/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reject instead/ })).toBeInTheDocument();
  });

  it("recalculate calls the backend and refreshes", async () => {
    const fn = mockApi((url, init) => {
      if (init.method === "POST") return json({ pools_created: 0 });
      return json(page([]));
    });
    renderPage();
    await screen.findByText("No requirements to pool");
    fireEvent.click(screen.getByRole("button", { name: /Recalculate/ }));
    await waitFor(() =>
      expect(
        fn.mock.calls.some(
          ([u, i]) =>
            (i as RequestInit)?.method === "POST" && u.endsWith("/demand-pools/recalculate"),
        ),
      ).toBe(true),
    );
  });
});
