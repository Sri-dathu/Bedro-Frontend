import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/bedro/ui";
import { describeApiError } from "@/components/bedro/query-notice";
import { reconcileMessage, sendMessage } from "@/services/email";
import { OUTCOME_EMAIL_LABEL, invalidateNegotiations, type NegotiationDetail } from "@/services/negotiations";

/** Supplier outcome notification (award or closure) as the backend reports it. It is a communication fact, kept
 *  separate from the business decision; "Sent" only after the email provider accepted the message. */
export function OutcomeEmailStatus({ n }: { n: NegotiationDetail }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const o = n.outcome_email;
  if (!o) {
    if (!n.decision) return null;
    // Every decision now records an outcome email; none means it was decided before supplier notifications existed.
    return (
      <p className="text-sm">
        Supplier notification:{" "}
        <Pill tone="neutral">
          {n.mode.startsWith("email")
            ? "Not sent — decided before supplier notifications were enabled"
            : "No email channel — supplier not notified"}
        </Pill>
      </p>
    );
  }
  const s = OUTCOME_EMAIL_LABEL[o.status] ?? { label: o.status, tone: "neutral" as const };
  const what = o.outcome === "award" ? "Acceptance confirmation" : "Closure notice";
  async function act(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(describeApiError(e));
    }
    await invalidateNegotiations(qc);
    setBusy(false);
  }
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm" aria-label="Supplier notification">
      <span>Supplier notification ({what.toLowerCase()}):</span>
      <Pill tone={s.tone}>{s.label}</Pill>
      {o.last_error && s.tone !== "success" && <span className="text-xs text-muted-foreground">{o.last_error}</span>}
      {o.message_id && (o.status === "failed" || o.status === "awaiting_authorization") && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => act(() => sendMessage(o.message_id!))}>
          {o.status === "failed" ? "Retry send" : "Send"}
        </Button>
      )}
      {o.message_id && o.status === "outcome_unknown" && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => act(() => reconcileMessage(o.message_id!))}>
          Check with provider
        </Button>
      )}
      {error && <span role="alert" className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
