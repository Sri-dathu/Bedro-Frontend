import { ApiError, apiRequest } from "./api";

export type Readiness = {
  status: "ready" | "not_ready";
  timestamp: string;
  checks: Record<string, { status: "ok" | "error"; detail: string | null }>;
};

/** Backend readiness. Throws ApiError(status 0) when the backend is unreachable — never reports a false "connected". */
export async function getBackendReadiness(signal?: AbortSignal): Promise<Readiness> {
  try {
    return await apiRequest<Readiness>("/health/ready", signal ? { signal } : {});
  } catch (e) {
    if (e instanceof ApiError && e.status === 503 && e.body) return e.body as Readiness; // reachable but not ready
    throw e;
  }
}
