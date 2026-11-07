import { AlertCircle, Check, HelpCircle, Info, X } from "lucide-react";
import type { Check as CheckT } from "@/services/negotiations";

const STYLE = {
  pass: { icon: Check, cls: "text-success" },
  fail: { icon: X, cls: "text-destructive" },
  unknown: { icon: HelpCircle, cls: "text-warning" },
  info: { icon: Info, cls: "text-muted-foreground" },
} as const;

/** Eligibility / verification checks as recorded by the backend. `onlyIssues` hides passed checks. */
export function CheckList({
  checks,
  onlyIssues = false,
}: {
  checks: CheckT[];
  onlyIssues?: boolean;
}) {
  const shown = onlyIssues ? checks.filter((c) => c.status !== "pass") : checks;
  if (!shown.length) return null;
  return (
    <ul className="space-y-1 text-xs">
      {shown.map((c) => {
        const { icon: Icon, cls } = STYLE[c.status];
        return (
          <li key={c.check + c.detail} className={`flex gap-1.5 ${cls}`}>
            <Icon className="mt-0.5 size-3.5 shrink-0" />
            <span>
              {c.detail}
              {!c.mandatory && c.status !== "info" && " (advisory)"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export function Notices({ notices }: { notices: string[] }) {
  return (
    <ul className="space-y-1 rounded-xl bg-secondary p-3 text-xs text-muted-foreground">
      {notices.map((n) => (
        <li key={n} className="flex gap-1.5">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
          {n}
        </li>
      ))}
    </ul>
  );
}
