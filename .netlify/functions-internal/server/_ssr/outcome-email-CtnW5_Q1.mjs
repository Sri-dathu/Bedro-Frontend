import { r as __toESM } from "../_runtime.mjs";
import { d as require_jsx_runtime, f as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { f as describeApiError, n as Button, s as Pill } from "./query-notice-CfqlvxHB.mjs";
import { C as sendMessage, m as invalidateNegotiations, n as OUTCOME_EMAIL_LABEL, x as reconcileMessage } from "./negotiations-BrGVm8_7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/outcome-email-CtnW5_Q1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Supplier outcome notification (award or closure) as the backend reports it. It is a communication fact, kept
*  separate from the business decision; "Sent" only after the email provider accepted the message. */
function OutcomeEmailStatus({ n }) {
	const qc = useQueryClient();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const o = n.outcome_email;
	if (!o) {
		if (!n.decision) return null;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-sm",
			children: [
				"Supplier notification:",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					tone: "neutral",
					children: n.mode.startsWith("email") ? "Not sent — decided before supplier notifications were enabled" : "No email channel — supplier not notified"
				})
			]
		});
	}
	const s = OUTCOME_EMAIL_LABEL[o.status] ?? {
		label: o.status,
		tone: "neutral"
	};
	const what = o.outcome === "award" ? "Acceptance confirmation" : "Closure notice";
	async function act(fn) {
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
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2 text-sm",
		"aria-label": "Supplier notification",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				"Supplier notification (",
				what.toLowerCase(),
				"):"
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
				tone: s.tone,
				children: s.label
			}),
			o.last_error && s.tone !== "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: o.last_error
			}),
			o.message_id && (o.status === "failed" || o.status === "awaiting_authorization") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				disabled: busy,
				onClick: () => act(() => sendMessage(o.message_id)),
				children: o.status === "failed" ? "Retry send" : "Send"
			}),
			o.message_id && o.status === "outcome_unknown" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				disabled: busy,
				onClick: () => act(() => reconcileMessage(o.message_id)),
				children: "Check with provider"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				role: "alert",
				className: "text-xs text-destructive",
				children: error
			})
		]
	});
}
//#endregion
export { OutcomeEmailStatus as t };
