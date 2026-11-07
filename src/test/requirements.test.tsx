import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Route } from "@/routes/workspace.requirements";
import { fetchRequirements, precheckFile, uploadRequirementFile } from "@/services/requirements";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const batchDto = (id: string, name = `${id}.csv`) => ({
  id,
  original_filename: name,
  file_type: "csv",
  file_size_bytes: 10,
  status: "ready",
  total_rows: 1,
  imported_rows: 1,
  rejected_rows: 0,
  unmapped_columns: [],
  uploaded_at: "2026-10-30T10:00:00Z",
  cancelled_at: null,
});
const itemDto = (id: string, batch_id: string) => ({
  id,
  batch_id,
  row_number: 2,
  status: "validated",
  source_requirement_id: "T-1",
  component_category: "Silicon Wafers",
  material_name: "Test Wafer",
  technical_specification: null,
  required_quantity: 10,
  unit_of_measure: "wafers",
  maximum_budget_per_unit: 5,
  currency: "USD",
  required_delivery_days: 30,
});
const page = (items: unknown[]) => ({ items, total: items.length, limit: 500, offset: 0 });

type Handler = (url: string, init: RequestInit) => Response | Promise<Response>;
function mockApi(handler: Handler) {
  const fn = vi.fn(async (url: string, init: RequestInit = {}) => handler(url, init));
  vi.stubGlobal("fetch", fn);
  return fn;
}
const calls = (fn: ReturnType<typeof mockApi>) =>
  fn.mock.calls.map(([u, i]) => `${(i as RequestInit)?.method ?? "GET"} ${new URL(u).pathname}`);

function renderPage() {
  const Page = Route.options.component!;
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <Page />
    </QueryClientProvider>,
  );
}
const file = (name: string, body = "material_name\nx") =>
  new File([body], name, { type: "text/csv" });

afterEach(() => vi.unstubAllGlobals());

describe("requirements service", () => {
  it("prechecks type and size in the browser", () => {
    expect(precheckFile(file("a.csv"))).toBeNull();
    expect(precheckFile(file("a.xlsx"))).toBeNull();
    expect(precheckFile(file("a.xls"))).toMatch(/Only \.csv and \.xlsx/);
    expect(precheckFile(file("a.csv", ""))).toMatch(/empty/);
  });

  it("uploads as multipart to the backend and maps the batch", async () => {
    const fn = mockApi(() =>
      json(
        {
          ...batchDto("B1"),
          status: "needs_review",
          rejected_rows: 1,
          column_mapping: {},
          row_errors: [{ row_number: 3, errors: [{ field: "qty", message: "bad" }], raw_data: {} }],
          possible_duplicate_of: [],
        },
        201,
      ),
    );
    const res = await uploadRequirementFile(file("reqs.csv"));
    const [url, init] = fn.mock.calls[0]!;
    expect(new URL(url).pathname).toBe("/api/v1/requirement-batches");
    expect(init?.method).toBe("POST");
    expect(init?.body).toBeInstanceOf(FormData);
    expect(res.batch).toMatchObject({ id: "B1", status: "needs_review", rejectedRows: 1 });
    expect(res.rowErrors[0]).toMatchObject({ rowNumber: 3 });
  });

  it("loads batches and their items with backend ids", async () => {
    mockApi((url) =>
      url.includes("/items") ? json(page([itemDto("I1", "B1")])) : json(page([batchDto("B1")])),
    );
    const r = await fetchRequirements();
    expect(r.batches[0]).toMatchObject({ id: "B1", itemIds: ["I1"] });
    expect(r.items["I1"]).toMatchObject({
      batchId: "B1",
      part: "Test Wafer",
      targetPrice: 5,
      currency: "USD",
      status: "Valid",
    });
  });
});

describe("Requirements page", () => {
  it("removing a selected, unsubmitted file never calls the backend", async () => {
    const fn = mockApi(() => json(page([])));
    renderPage();
    await screen.findByText("No requirement batches");
    fireEvent.change(screen.getByTestId("file-input"), { target: { files: [file("draft.csv")] } });
    expect(screen.getByText("draft.csv")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove draft.csv from selection" }));
    expect(screen.queryByText("draft.csv")).not.toBeInTheDocument();
    expect(calls(fn).every((c) => c.startsWith("GET"))).toBe(true); // no upload, no cancel
  });

  it("keeps a rejected upload selected and shows the backend reason", async () => {
    mockApi((url, init) =>
      init.method === "POST"
        ? json(
            {
              error: {
                code: "missing_columns",
                message: "Missing required columns: unit_of_measure.",
                details: null,
              },
            },
            422,
          )
        : json(page([])),
    );
    renderPage();
    await screen.findByText("No requirement batches");
    fireEvent.change(screen.getByTestId("file-input"), { target: { files: [file("bad.csv")] } });
    fireEvent.click(screen.getByRole("button", { name: "Upload" }));
    expect(
      await screen.findByText("Missing required columns: unit_of_measure."),
    ).toBeInTheDocument();
    expect(screen.getByText("bad.csv")).toBeInTheDocument();
  });

  it("removes a submitted batch only after confirmation and backend success", async () => {
    let cancelled = false;
    const fn = mockApi((url, init) => {
      if (init.method === "POST" && url.endsWith("/B1/cancel")) {
        cancelled = true;
        return json({ ...batchDto("B1"), status: "cancelled" });
      }
      if (url.includes("/items")) return json(page([itemDto("I1", "B1")]));
      return json(
        page(
          cancelled
            ? [batchDto("B2", "keep.csv")]
            : [batchDto("B1", "remove.csv"), batchDto("B2", "keep.csv")],
        ),
      );
    });
    renderPage();
    const card = await screen.findByRole("region", { name: "Batch remove.csv" });
    fireEvent.click(within(card).getByRole("button", { name: /Remove batch/ }));
    const dialog = await screen.findByRole("alertdialog");
    expect(calls(fn)).not.toContain("POST /api/v1/requirement-batches/B1/cancel"); // nothing before confirming
    fireEvent.click(within(dialog).getByRole("button", { name: "Remove batch" }));
    await waitFor(() =>
      expect(screen.queryByRole("region", { name: "Batch remove.csv" })).not.toBeInTheDocument(),
    );
    expect(screen.getByRole("region", { name: "Batch keep.csv" })).toBeInTheDocument();
    expect(calls(fn)).toContain("POST /api/v1/requirement-batches/B1/cancel");
  });

  it("keeps the batch listed and shows the error when removal fails", async () => {
    mockApi((url, init) => {
      if (init.method === "POST")
        return json(
          {
            error: {
              code: "internal_error",
              message: "An unexpected error occurred.",
              details: null,
            },
          },
          500,
        );
      if (url.includes("/items")) return json(page([itemDto("I1", "B1")]));
      return json(page([batchDto("B1", "remove.csv")]));
    });
    renderPage();
    const card = await screen.findByRole("region", { name: "Batch remove.csv" });
    fireEvent.click(within(card).getByRole("button", { name: /Remove batch/ }));
    const dialog = await screen.findByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Remove batch" }));
    expect(
      await within(dialog).findByText(/Could not remove the batch: An unexpected error occurred/),
    ).toBeInTheDocument();
    // the modal hides the page from the accessibility tree while open; the batch is still rendered
    expect(
      screen.getByRole("region", { name: "Batch remove.csv", hidden: true }),
    ).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Keep batch" }));
    await waitFor(() =>
      expect(screen.getByRole("region", { name: "Batch remove.csv" })).toBeInTheDocument(),
    );
  });
});
