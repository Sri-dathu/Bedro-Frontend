import { r as __toESM } from "../_runtime.mjs";
import { d as require_jsx_runtime, f as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as require_lucide_react } from "../_libs/lucide-react.mjs";
import { a as LoadingNotice, c as SimTag, f as describeApiError, i as ErrorNotice, m as money, n as Button, o as PageHeader, r as Empty, s as Pill } from "./query-notice-CfqlvxHB.mjs";
import { _ as negotiationQuery, d as decideNegotiation, j as useNegotiations, m as invalidateNegotiations, r as STATUS_LABEL } from "./negotiations-BrGVm8_7.mjs";
import { n as Notices, t as CheckList } from "./checks-BykImcHt.mjs";
import { t as OutcomeEmailStatus } from "./outcome-email-CtnW5_Q1.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workspace.decision-D4fNLGJj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lucide_react = require_lucide_react();
var DECIDABLE = [
	"awaiting_buyer_decision",
	"manual_review_required",
	"accepted_by_buyer",
	"rejected_by_buyer",
	"verification_failed"
];
function Decision() {
	const q = useNegotiations();
	const list = (q.data ?? []).filter((n) => DECIDABLE.includes(n.status));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Sourcing Decision",
		description: "Review the verified final offer and explicitly accept or decline it. A recommendation is never a purchase; accepting records your decision only."
	}), q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading offers…" }) : q.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
		title: "Offers unavailable.",
		error: q.error,
		onRetry: () => q.refetch()
	}) : list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.CheckCircle2, { className: "size-5" }),
		title: "No offers awaiting decision",
		body: "Verified final offers from completed negotiations appear here for your decision."
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-4",
		children: list.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FinalOffer, { id: n.id }, n.id))
	})] });
}
function FinalOffer({ id }) {
	const qc = useQueryClient();
	const q = useQuery(negotiationQuery(id));
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	if (q.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "surface p-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading offer…" })
	});
	if (q.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
		title: "Offer unavailable.",
		error: q.error,
		onRetry: () => q.refetch()
	});
	const n = q.data;
	const o = n.offers.find((x) => x.id === n.final_offer_id);
	const s = STATUS_LABEL[n.status];
	async function decide(d) {
		setBusy(true);
		setError(null);
		try {
			await decideNegotiation(n.id, d);
		} catch (e) {
			setError(describeApiError(e));
		}
		await invalidateNegotiations(qc);
		setBusy(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface p-6",
		"aria-label": `Final offer from ${n.company_name}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mr-auto text-lg font-semibold",
						children: n.company_name
					}),
					n.simulated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimTag, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: s.tone,
						children: s.label
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [
					n.material_name,
					" · ",
					n.subject_type === "demand_pool" ? `pooled demand (${n.context.allocations.length} items)` : "single requirement"
				]
			}),
			o && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-5 grid grid-cols-2 gap-4 md:grid-cols-4",
				children: [
					["Unit price", o.unit_price !== null ? money(o.unit_price, o.currency ?? n.currency) : "—"],
					["Quantity", `${(o.quantity ?? 0).toLocaleString()} ${o.unit_of_measure ?? ""}`],
					["Lead time", o.lead_time_days !== null ? `${o.lead_time_days} days` : "Not stated"],
					["Total (goods only)", o.verification?.computed_total != null ? money(o.verification.computed_total, n.currency) : "—"]
				].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
					className: "text-xs uppercase tracking-wider text-muted-foreground",
					children: k
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
					className: "mt-1 font-display text-xl font-semibold",
					children: v
				})] }, k))
			}),
			n.recommendation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 rounded-xl bg-accent p-3 text-sm text-accent-foreground",
				children: n.recommendation
			}),
			o?.verification && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h4", {
					className: "mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
					children: ["Independent verification — ", o.verification.status.replace("_", " ")]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckList, { checks: o.verification.checks })]
			}),
			n.subject_type === "demand_pool" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-1 text-xs text-muted-foreground",
				children: n.context.allocations.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [
					a.batch_filename,
					" · row ",
					a.row_number,
					a.source_requirement_id && ` · ${a.source_requirement_id}`,
					": ",
					Number(a.quantity).toLocaleString(),
					" ",
					a.unit_of_measure
				] }, a.item_id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notices, { notices: n.notices })
			}),
			(n.allowed_actions.includes("accept") || n.allowed_actions.includes("reject")) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex gap-3",
				children: [n.allowed_actions.includes("accept") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: busy,
					onClick: () => decide("accept"),
					children: "Accept Offer"
				}), n.allowed_actions.includes("reject") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					disabled: busy,
					onClick: () => decide("reject"),
					children: "Decline Offer"
				})]
			}),
			n.decision && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-sm",
				children: ["Your decision: ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					tone: n.decision.decision === "accepted" ? "success" : "neutral",
					children: n.decision.decision
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutcomeEmailStatus, { n })
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 text-sm text-destructive",
				children: error
			})
		]
	});
}
//#endregion
export { Decision as component };
