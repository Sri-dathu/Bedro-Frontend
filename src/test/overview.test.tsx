import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", async (orig) => ({
  ...(await orig<typeof import("@tanstack/react-router")>()),
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
const { Route } = await import("@/routes/workspace.index");

const json = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
const page = { items: [], total: 0, limit: 500, offset: 0 };
const emailStatus = (o: object) => ({
  channel: "test",
  provider: "gmail",
  test_mode: true,
  test_recipient: "test-inbox@example.com",
  send_authorization: "agent",
  message: "m",
  provider_status: {
    configured: true,
    state: "connected",
    detail: null,
    authorised_mailbox: "sender@gmail.com",
    problem: null,
  },
  ...o,
});

const counts = (o: object) => ({
  not_started: 0,
  active: 0,
  pending_review: 0,
  completed: 0,
  unresolved: 0,
  cancelled: 0,
  ...o,
});
const request = (id: string, c: object) => ({
  id,
  request_ref: id,
  original_filename: `${id}.csv`,
  uploaded_at: "2026-11-01T10:00:00",
  batch_status: "ready",
  total_requirements: 0,
  rejected_rows: 0,
  counts: counts(c),
  status: "in_progress",
});

function renderOverview(email: object, sync: object, requests: unknown = []) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const path = new URL(url).pathname;
      if (path === "/api/v1/procurement-requests")
        return requests instanceof Response ? requests : json(requests);
      if (path === "/api/v1/health/ready") return json({ status: "ready" });
      if (path === "/api/v1/integrations/status")
        return json({ llm: { configured: true, enabled: true }, simulation_mode: "off" });
      if (path === "/api/v1/email/status") return json(email);
      if (path === "/api/v1/email/sync/status") return json(sync);
      return json(page);
    }),
  );
  const Page = Route.options.component as () => ReactNode;
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <Page />
    </QueryClientProvider>,
  );
}
const row = async (name: string) => (await screen.findByText(name)).closest("li") as HTMLElement;

afterEach(() => vi.unstubAllGlobals());

describe("Overview integration status", () => {
  it("shows the real email channel and the last inbox check", async () => {
    renderOverview(emailStatus({}), {
      last_run: {
        id: 1,
        trigger: "manual",
        status: "ok",
        counts: {},
        error: null,
        started_at: "2026-10-30T18:24:33",
        finished_at: "2026-10-30T18:24:35",
      },
      last_success: null,
      polling_interval_seconds: 0,
    });
    expect(
      await within(await row("Supplier email service")).findByText("Connected · Gmail test mode"),
    ).toBeInTheDocument();
    expect(await within(await row("Supplier replies")).findByText(/^Checked /)).toBeInTheDocument();
    expect(screen.queryByText(/Phase 6/)).not.toBeInTheDocument();
    expect(screen.queryByText("Not Connected")).not.toBeInTheDocument();
  });

  it("flags a Gmail account that cannot work and an unconfigured channel", async () => {
    renderOverview(
      emailStatus({
        provider_status: {
          configured: true,
          state: "connected",
          authorised_mailbox: "test-inbox@example.com",
          problem: "Gmail is authorised as the test inbox",
        },
      }),
      { last_run: null, last_success: null, polling_interval_seconds: 0 },
    );
    expect(
      await within(await row("Supplier email service")).findByText("Wrong Gmail account"),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Gmail is authorised as the test inbox");
    expect(
      await within(await row("Supplier replies")).findByText("Not checked yet"),
    ).toBeInTheDocument();
  });

  it("reports no email channel honestly", async () => {
    renderOverview(emailStatus({ channel: "none", provider: "none", provider_status: null }), {
      last_run: null,
      last_success: null,
      polling_interval_seconds: 0,
    });
    expect(
      await within(await row("Supplier email service")).findByText("Not configured"),
    ).toBeInTheDocument();
    expect(
      await within(await row("Supplier replies")).findByText("No email channel"),
    ).toBeInTheDocument();
  });

  it.each([
    [
      { configured: false, state: "authorization_required", detail: "Gmail is not authorised yet" },
      "Authorization required",
    ],
    [
      {
        configured: true,
        state: "connection_failed",
        detail: "Could not reach Gmail (TimeoutError)",
      },
      "Connection failed",
    ],
  ])("does not show Connected when the backend could not verify Gmail (%#)", async (ps, label) => {
    renderOverview(
      emailStatus({ provider_status: { authorised_mailbox: null, problem: null, ...ps } }),
      {
        last_run: null,
        last_success: null,
        polling_interval_seconds: 0,
      },
    );
    expect(await within(await row("Supplier email service")).findByText(label)).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(ps.detail);
    expect(screen.queryByText(/^Connected ·/)).not.toBeInTheDocument();
  });
});

describe("Overview analytics", () => {
  const email = emailStatus({});
  const sync = { last_run: null, last_success: null, polling_interval_seconds: 0 };

  it("replaces the workflow section with live procurement analytics", async () => {
    renderOverview(email, sync, [
      request("PR-1", { not_started: 2, active: 3, pending_review: 1, completed: 4, cancelled: 9 }),
      request("PR-2", { active: 1, unresolved: 2 }),
    ]);
    const section = await screen.findByRole("region", { name: "Analytics" });
    expect(
      await within(section).findByLabelText("13 procurement requirements"),
    ).toBeInTheDocument(); // cancelled excluded
    const stage = (label: string) => within(section).getByText(label).closest("li") as HTMLElement;
    expect(within(stage("Awaiting supplier response")).getByText("4")).toBeInTheDocument();
    expect(within(stage("Sourcing decision completed")).getByText("31%")).toBeInTheDocument();
    expect(stage("Offer to review")).toHaveAttribute(
      "title",
      expect.stringMatching(/^Offer to review: 1 of 13/),
    );
    expect(screen.queryByText("Workflow updates")).not.toBeInTheDocument();
  });

  it("handles zero data and API failures", async () => {
    renderOverview(email, sync, []);
    expect(await screen.findByLabelText("0 procurement requirements")).toBeInTheDocument();
    expect(screen.getByText(/No active requirements yet/)).toBeInTheDocument();
    cleanup();
    renderOverview(
      email,
      sync,
      new Response(JSON.stringify({ error: { code: "internal_error", message: "boom" } }), {
        status: 500,
      }),
    );
    expect(
      await screen.findByText("Analytics unavailable.", {}, { timeout: 5000 }),
    ).toBeInTheDocument();
  });
});
