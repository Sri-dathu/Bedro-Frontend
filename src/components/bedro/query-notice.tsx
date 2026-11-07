import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_BASE_URL, ApiError } from "@/services/api";

/** Human-readable reason for a failed backend call. */
export function describeApiError(error: unknown): string {
  if (error instanceof ApiError && error.status === 0)
    return `The backend is not reachable at ${API_BASE_URL}.`;
  return error instanceof Error ? error.message : "Unknown error.";
}

export function LoadingNotice({ children }: { children: string }) {
  return (
    <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      {children}
    </p>
  );
}

/** Error state for backend-backed data. Shows the failure instead of placeholder data. */
export function ErrorNotice({
  title,
  error,
  onRetry,
  suffix,
}: {
  title: string;
  error: unknown;
  onRetry?: () => void;
  suffix?: string;
}) {
  return (
    <div role="alert" className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
        <span>
          <span className="font-semibold">{title}</span> {describeApiError(error)}
          {suffix && ` ${suffix}`}
        </span>
      </div>
      {onRetry && (
        <Button size="sm" variant="outline" className="mt-3" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
