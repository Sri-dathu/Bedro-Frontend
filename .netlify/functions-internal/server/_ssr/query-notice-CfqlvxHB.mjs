import { r as __toESM } from "../_runtime.mjs";
import { d as require_jsx_runtime, f as require_react, l as Slot } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as require_lucide_react } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/query-notice-CfqlvxHB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lucide_react = require_lucide_react();
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium cursor-pointer transition-[color,background-color,box-shadow,transform] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
			outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
			secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-full px-3 text-xs",
			lg: "h-11 rounded-full px-8",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
function PageHeader({ title, description, actions }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-8 flex flex-wrap items-end justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-semibold md:text-3xl",
			children: title
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1.5 max-w-2xl text-sm text-muted-foreground",
			children: description
		})] }), actions]
	});
}
var tones = {
	neutral: "bg-secondary text-secondary-foreground",
	primary: "bg-accent text-accent-foreground",
	success: "bg-success/10 text-success",
	warning: "bg-warning/10 text-warning",
	danger: "bg-destructive/10 text-destructive"
};
function Pill({ tone = "neutral", children, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className),
		children
	});
}
function SimTag() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
		tone: "warning",
		children: "Preview / Simulated"
	});
}
function Empty({ icon, title, body, action }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface flex flex-col items-center px-6 py-14 text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 grid size-12 place-items-center rounded-2xl bg-accent text-accent-foreground",
				children: icon
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "text-lg font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 max-w-md text-sm text-muted-foreground",
				children: body
			}),
			action && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: action
			})
		]
	});
}
function Stat({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 font-display text-3xl font-semibold",
				children: value
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-xs text-muted-foreground",
				children: hint
			})
		]
	});
}
var money = (n, c = "USD") => new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: c,
	maximumFractionDigits: 2
}).format(n);
/** Shared HTTP client for the BEDRO FastAPI backend. Domain services call this; UI components never do. */
var API_BASE_URL = String({
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/"
}["VITE_API_BASE_URL"] || "http://localhost:8000").replace(/\/+$/, "");
var PREFIX = "/api/v1";
/** Company workspace (not authentication). Unset = the backend's "default" workspace. */
var WORKSPACE_ID = String({
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/"
}["VITE_WORKSPACE_ID"] || "");
/** Backend error envelope: { error: { code, message, details } }. status 0 = backend unreachable. */
var ApiError = class extends Error {
	status;
	code;
	details;
	body;
	constructor(status, code, message, details, body) {
		super(message);
		this.status = status;
		this.code = code;
		this.details = details;
		this.body = body;
		this.name = "ApiError";
	}
};
async function apiRequest(path, { method = "GET", body, signal, timeoutMs = 15e3, headers: extra = {} } = {}) {
	const ctrl = new AbortController();
	let timedOut = false;
	const timer = setTimeout(() => {
		timedOut = true;
		ctrl.abort();
	}, timeoutMs);
	signal?.addEventListener("abort", () => ctrl.abort(), { once: true });
	const init = {
		method,
		signal: ctrl.signal
	};
	const headers = { ...extra };
	if (WORKSPACE_ID) headers["X-Workspace-Id"] = WORKSPACE_ID;
	if (body instanceof FormData) init.body = body;
	else if (body !== void 0) {
		init.body = JSON.stringify(body);
		headers["Content-Type"] = "application/json";
	}
	if (Object.keys(headers).length) init.headers = headers;
	let res;
	try {
		res = await fetch(`${API_BASE_URL}${PREFIX}${path}`, init);
	} catch {
		if (timedOut) throw new ApiError(0, "timeout", "The backend did not respond in time.");
		if (signal?.aborted) throw new ApiError(0, "aborted", "Request was cancelled.");
		throw new ApiError(0, "network_error", "Backend is unreachable.");
	} finally {
		clearTimeout(timer);
	}
	const data = res.status === 204 ? null : await res.json().catch(() => null);
	if (!res.ok) {
		const err = data?.error;
		throw new ApiError(res.status, err?.code ?? `http_${res.status}`, err?.message ?? `Request failed (${res.status}).`, err?.details, data);
	}
	return data;
}
/** Follows limit/offset pagination until every record is loaded. */
async function fetchAllPages(path, signal, pageSize = 500) {
	const out = [];
	const sep = path.includes("?") ? "&" : "?";
	for (;;) {
		const page = await apiRequest(`${path}${sep}limit=${pageSize}&offset=${out.length}`, signal ? { signal } : {});
		out.push(...page.items);
		if (!page.items.length || out.length >= page.total) return out;
	}
}
/** Human-readable reason for a failed backend call. */
function describeApiError(error) {
	if (error instanceof ApiError && error.status === 0) return `The backend is not reachable at ${API_BASE_URL}.`;
	return error instanceof Error ? error.message : "Unknown error.";
}
function LoadingNotice({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		role: "status",
		className: "flex items-center gap-2 text-sm text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Loader2, { className: "size-4 animate-spin" }), children]
	});
}
/** Error state for backend-backed data. Shows the failure instead of placeholder data. */
function ErrorNotice({ title, error, onRetry, suffix }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "alert",
		className: "rounded-xl bg-destructive/10 p-4 text-sm text-destructive",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.AlertTriangle, { className: "mt-0.5 size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: title
				}),
				" ",
				describeApiError(error),
				suffix && ` ${suffix}`
			] })]
		}), onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			size: "sm",
			variant: "outline",
			className: "mt-3",
			onClick: onRetry,
			children: "Retry"
		})]
	});
}
//#endregion
export { LoadingNotice as a, SimTag as c, buttonVariants as d, describeApiError as f, ErrorNotice as i, Stat as l, money as m, Button as n, PageHeader as o, fetchAllPages as p, Empty as r, Pill as s, ApiError as t, apiRequest as u };
