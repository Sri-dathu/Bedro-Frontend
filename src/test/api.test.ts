import { afterEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL, ApiError, apiRequest } from "@/services/api";
import { getBackendReadiness } from "@/services/health";

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

afterEach(() => vi.unstubAllGlobals());

describe("api client", () => {
  it("calls the configured base URL under /api/v1", async () => {
    const fetchMock = vi.fn().mockResolvedValue(json(200, { status: "alive" }));
    vi.stubGlobal("fetch", fetchMock);
    await apiRequest("/health/live");
    expect(fetchMock.mock.calls[0]![0]).toBe(`${API_BASE_URL}/api/v1/health/live`);
  });

  it("turns the backend error envelope into an ApiError", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          json(404, { error: { code: "not_found", message: "Batch not found", details: null } }),
        ),
    );
    await expect(apiRequest("/x")).rejects.toMatchObject({
      status: 404,
      code: "not_found",
      message: "Batch not found",
    });
  });

  it("reports an unreachable backend as status 0, not success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    const err = await apiRequest("/x").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err).toMatchObject({ status: 0, code: "network_error" });
  });
});

describe("getBackendReadiness", () => {
  it("returns the not_ready body on 503 instead of throwing", async () => {
    const body = {
      status: "not_ready",
      timestamp: "t",
      checks: { database: { status: "error", detail: "Database connection failed." } },
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(json(503, body)));
    await expect(getBackendReadiness()).resolves.toEqual(body);
  });
});
