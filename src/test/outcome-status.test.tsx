import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OutcomeEmailStatus } from "@/components/bedro/outcome-email";
import { countByStage, type NegotiationDetail, type NegotiationStatus } from "@/services/negotiations";

const detail = (o: Partial<NegotiationDetail>) => ({ mode: "email_test", decision: null, outcome_email: null, ...o }) as NegotiationDetail;
const wrap = (n: NegotiationDetail) =>
  render(<QueryClientProvider client={new QueryClient()}><OutcomeEmailStatus n={n} /></QueryClientProvider>);

describe("negotiation stages", () => {
  it("counts a supplier agreement as awaiting approval, not as a concluded success", () => {
    const list = (["awaiting_buyer_decision", "accepted_by_buyer", "awaiting_supplier_response", "no_agreement",
      "manual_review_required", "cancelled"] as NegotiationStatus[]).map((status) => ({ status }));
    expect(countByStage(list)).toEqual({
      negotiating: 1, awaiting_approval: 1, needs_review: 1, concluded_success: 1, concluded_no_deal: 2,
    });
  });
});

describe("supplier notification status", () => {
  const decided = { decision: "accepted" as const, offer_was_simulated: false, decided_at: "2026-11-01T10:00:00Z" };

  it("shows Sent only when the provider confirmed it — never the old Phase 6 placeholder", () => {
    wrap(detail({ decision: decided, outcome_email: { outcome: "award", message_id: "m1", status: "accepted_by_provider", last_error: null, send_attempts: 1 } }));
    expect(screen.getByText("Sent")).toBeInTheDocument();
    expect(screen.queryByText(/Phase 6/)).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows a real failure with a retry, and a pending state before dispatch", () => {
    const { unmount } = wrap(detail({ decision: decided, outcome_email: { outcome: "award", message_id: "m1", status: "failed", last_error: "provider rejected the message", send_attempts: 1 } }));
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("provider rejected the message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry send" })).toBeInTheDocument();
    unmount();
    wrap(detail({ decision: decided, outcome_email: { outcome: "closure", message_id: null, status: "pending", last_error: null, send_attempts: 0 } }));
    expect(screen.getByText(/Pending/)).toBeInTheDocument();
  });

  it("is honest when no email channel exists", () => {
    wrap(detail({ mode: "live", decision: decided }));
    expect(screen.getByText(/No email channel — supplier not notified/)).toBeInTheDocument();
  });
});
