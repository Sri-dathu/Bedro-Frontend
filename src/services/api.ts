/** Shared HTTP client for the BEDRO FastAPI backend. Domain services call this; UI components never do. */
export const API_BASE_URL = String(
  import.meta.env["VITE_API_BASE_URL"] || "http://localhost:8000",
).replace(/\/+$/, "");
const PREFIX = "/api/v1";
/** Company workspace (not authentication). Unset = the backend's "default" workspace. */
const WORKSPACE_ID = String(import.meta.env["VITE_WORKSPACE_ID"] || "");

/** Backend error envelope: { error: { code, message, details } }. status 0 = backend unreachable. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
  timeoutMs?: number;
  headers?: Record<string, string>;
};

export async function apiRequest<T>(
  path: string,
  { method = "GET", body, signal, timeoutMs = 15_000, headers: extra = {} }: Options = {},
): Promise<T> {
  const ctrl = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, timeoutMs);
  signal?.addEventListener("abort", () => ctrl.abort(), { once: true });
  const init: RequestInit = { method, signal: ctrl.signal };
  const headers: Record<string, string> = { ...extra };
  if (WORKSPACE_ID) headers["X-Workspace-Id"] = WORKSPACE_ID;
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) {
    init.body = JSON.stringify(body);
    headers["Content-Type"] = "application/json";
  }
  if (Object.keys(headers).length) init.headers = headers;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${PREFIX}${path}`, init);
  } catch {
    if (timedOut) throw new ApiError(0, "timeout", "The backend did not respond in time.");
    if (signal?.aborted) throw new ApiError(0, "aborted", "Request was cancelled.");
    throw new ApiError(0, "network_error", "Backend is unreachable.");
  } finally {
    clearTimeout(timer);
  }

  const data: unknown = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const err = (data as { error?: { code?: string; message?: string; details?: unknown } } | null)
      ?.error;
    throw new ApiError(
      res.status,
      err?.code ?? `http_${res.status}`,
      err?.message ?? `Request failed (${res.status}).`,
      err?.details,
      data,
    );
  }
  return data as T;
}

export type Page<T> = { items: T[]; total: number; limit: number; offset: number };

/** Follows limit/offset pagination until every record is loaded. */
export async function fetchAllPages<T>(
  path: string,
  signal?: AbortSignal,
  pageSize = 500,
): Promise<T[]> {
  const out: T[] = [];
  const sep = path.includes("?") ? "&" : "?";
  for (;;) {
    const page = await apiRequest<Page<T>>(
      `${path}${sep}limit=${pageSize}&offset=${out.length}`,
      signal ? { signal } : {},
    );
    out.push(...page.items);
    if (!page.items.length || out.length >= page.total) return out;
  }
}
