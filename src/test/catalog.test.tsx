import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CatalogNotice, catalogStatus } from "@/components/bedro/catalog-notice";
import { ApiError } from "@/services/api";
import { fetchCatalog, isSampleData } from "@/services/catalog";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

const offering = (offering_id: string, supplier_id: string) => ({
  offering_id,
  supplier_id,
  company_name: supplier_id,
  component_category: "Silicon Wafers",
  material_name: "Test Wafer",
  material_grade: null,
  specification: null,
  unit_of_measure: "wafers",
  minimum_order_quantity: null,
  unit_price: 1,
  currency: "USD",
  lead_time_days: null,
  available_quantity: null,
  quality_rating: null,
  quality_certification: null,
  delivery_reliability_pct: null,
  country_of_origin: null,
  compliance_status: null,
  counterfeit_risk_level: null,
  process_node_nm: null,
  node_size_nm: null,
  chip_category: null,
  application: null,
  memory_type: null,
  memory_technology: null,
  target_hardware: null,
  last_updated: null,
  data_source: "sample_csv",
});
const supplier = (supplier_id: string) => ({
  supplier_id,
  company_name: supplier_id,
  company_type: null,
  country: null,
  certifications: [],
  manufacturing_capabilities: ["Cap A"],
  fabrication_ownership: null,
  chip_model_reference: null,
  offering_count: 1,
  data_source: "sample_csv",
});

afterEach(() => vi.unstubAllGlobals());

describe("fetchCatalog", () => {
  it("loads suppliers and offerings from the API, paging and grouping by supplier", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      const offset = Number(new URL(url).searchParams.get("offset"));
      if (url.includes("/suppliers"))
        return json({ items: [supplier("S1"), supplier("S2")], total: 2, limit: 500, offset });
      // two pages of offerings
      return offset === 0
        ? json({ items: [offering("O1", "S1")], total: 2, limit: 500, offset })
        : json({ items: [offering("O2", "S2")], total: 2, limit: 500, offset });
    });
    vi.stubGlobal("fetch", fetchMock);
    const c = await fetchCatalog();
    expect(c.offerings.map((o) => o.offering_id)).toEqual(["O1", "O2"]);
    expect(
      c.suppliers.map((s) => [
        s.supplier_id,
        s.offerings.map((o) => o.offering_id),
        s.capabilities,
      ]),
    ).toEqual([
      ["S1", ["O1"], ["Cap A"]],
      ["S2", ["O2"], ["Cap A"]],
    ]);
    expect(isSampleData(c)).toBe(true);
    expect(
      fetchMock.mock.calls.some(([u]) => u.includes("/api/v1/offerings?limit=500&offset=1")),
    ).toBe(true);
  });

  it("propagates API failures instead of returning fake data", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(fetchCatalog()).rejects.toMatchObject({ status: 0, code: "network_error" });
  });
});

describe("catalog states", () => {
  const data = (n: number) => ({
    suppliers: [],
    offerings: Array.from({ length: n }, (_, i) => offering(`O${i}`, "S")),
  });

  it("derives pending / error / empty / ready", () => {
    expect(catalogStatus({ isPending: true, isError: false })).toBe("pending");
    expect(catalogStatus({ isPending: false, isError: true })).toBe("error");
    expect(catalogStatus({ isPending: false, isError: false, data: data(0) })).toBe("empty");
    expect(catalogStatus({ isPending: false, isError: false, data: data(1) })).toBe("ready");
  });

  it("renders loading, empty and unreachable-backend messages", () => {
    const { rerender } = render(<CatalogNotice status="pending" />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading supplier catalogue");
    rerender(<CatalogNotice status="empty" />);
    expect(screen.getByRole("status")).toHaveTextContent("supplier database is empty");
    const retry = vi.fn();
    rerender(
      <CatalogNotice
        status="error"
        error={new ApiError(0, "network_error", "x")}
        onRetry={retry}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("not reachable");
    expect(screen.getByRole("alert")).toHaveTextContent("No supplier data is shown");
    screen.getByRole("button", { name: "Retry" }).click();
    expect(retry).toHaveBeenCalled();
  });
});
