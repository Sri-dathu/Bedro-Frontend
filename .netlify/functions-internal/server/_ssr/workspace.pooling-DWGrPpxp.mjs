import { r as __toESM } from "../_runtime.mjs";
import { d as require_jsx_runtime, f as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { t as require_lucide_react } from "../_libs/lucide-react.mjs";
import { a as LoadingNotice, f as describeApiError, i as ErrorNotice, l as Stat, n as Button, o as PageHeader, r as Empty, s as Pill } from "./query-notice-CfqlvxHB.mjs";
import { r as invalidateRequests } from "./procurement-CAPgAIqk.mjs";
import { a as usePools, i as useAssessments, n as invalidatePooling, r as recalculatePools, t as decidePool } from "./pooling-CdXIbSpH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workspace.pooling-DWGrPpxp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lucide_react = require_lucide_react();
var OUTCOME = {
	needs_clarification: {
		label: "Needs clarification",
		tone: "warning"
	},
	incompatible: {
		label: "Not compatible",
		tone: "danger"
	},
	no_match: {
		label: "No matching demand",
		tone: "neutral"
	},
	pooled: {
		label: "Pooled",
		tone: "success"
	},
	excluded: {
		label: "Excluded",
		tone: "neutral"
	}
};
var APPROVAL = {
	pending: {
		label: "Awaiting your approval",
		tone: "warning"
	},
	approved: {
		label: "Approved",
		tone: "success"
	},
	rejected: {
		label: "Rejected — sourced individually",
		tone: "neutral"
	}
};
var approvalOf = (p) => p.approval_status ?? "pending";
var ORDER = [
	"needs_clarification",
	"incompatible",
	"no_match"
];
var qty = (n) => n.toLocaleString(void 0, { maximumFractionDigits: 4 });
var day = (d) => (/* @__PURE__ */ new Date(`${d}T00:00:00`)).toLocaleDateString();
/** Quantities are only ever added within one unit of measure (the backend never converts units). */
var byUnit = (rows) => {
	const m = /* @__PURE__ */ new Map();
	for (const r of rows) m.set(r.unit, (m.get(r.unit) ?? 0) + r.n);
	return [...m].map(([u, n]) => `${qty(n)} ${u}`).join(" · ") || "—";
};
function Pooling() {
	const qc = useQueryClient();
	const pools = usePools();
	const assessments = useAssessments();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function recalc() {
		setBusy(true);
		setError(null);
		try {
			await recalculatePools();
			await invalidatePooling(qc);
		} catch (e) {
			setError(describeApiError(e));
		} finally {
			setBusy(false);
		}
	}
	const notPooled = (assessments.data ?? []).filter((a) => ORDER.includes(a.outcome)).sort((a, b) => ORDER.indexOf(a.outcome) - ORDER.indexOf(b.outcome));
	const loading = pools.isPending || assessments.isPending;
	const open = (assessments.data ?? []).filter((a) => a.outcome !== "excluded");
	const count = (o) => open.filter((a) => a.outcome === o).length;
	const poolList = [...pools.data ?? []].sort((a, b) => Number(approvalOf(b) === "pending") - Number(approvalOf(a) === "pending"));
	const pending = poolList.filter((p) => approvalOf(p) === "pending").length;
	const failed = pools.isError ? pools : assessments.isError ? assessments : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Demand Pooling",
			description: "Requirement items that are genuinely compatible — same component, specification, unit, grade and delivery country, with close delivery deadlines. Original items are never merged or changed. Approve a pool to negotiate its combined demand with one supplier, or reject it to source its items individually — nothing pooled is sent to a supplier until you decide.",
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				variant: "outline",
				size: "sm",
				disabled: busy,
				onClick: recalc,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.RefreshCw, { className: `size-4 ${busy ? "animate-spin" : ""}` }), busy ? "Recalculating…" : "Recalculate"]
			})
		}),
		error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mb-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
				title: "Recalculation failed.",
				error: new Error(error)
			})
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading demand pools…" }) : failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
			title: "Demand pools unavailable.",
			error: failed.error,
			onRetry: () => {
				pools.refetch();
				assessments.refetch();
			}
		}) : open.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Layers, { className: "size-5" }),
			title: "No requirements to pool",
			body: "Upload requirement files; every valid item is checked for compatible demand automatically."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-8 grid grid-cols-2 gap-4 md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Sourcing opportunities",
						value: poolList.length,
						hint: pending ? `${pending} awaiting your approval` : "Confirmed pools containing your demand"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Pooled requirements",
						value: count("pooled"),
						hint: `of ${open.length} active requirements`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Combined pooled demand",
						value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xl",
							children: byUnit(poolList.map((p) => ({
								unit: p.unit_of_measure,
								n: p.aggregate_quantity
							})))
						}),
						hint: `Your share: ${byUnit(poolList.map((p) => ({
							unit: p.unit_of_measure,
							n: p.own_quantity ?? 0
						})))}`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "Awaiting clarification",
						value: count("needs_clarification"),
						hint: `${count("incompatible")} not compatible · ${count("no_match")} no matching demand`
					})
				]
			}),
			pending > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				role: "status",
				className: "surface mb-4 border-warning/40 p-4 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-medium",
						children: [
							pending,
							" ",
							pending === 1 ? "pool needs" : "pools need",
							" your decision."
						]
					}),
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-muted-foreground",
						children: "Their requirements are held back from supplier negotiation (and no email is sent) until you approve or reject."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
				children: [
					"Confirmed pools (",
					poolList.length,
					")"
				]
			}),
			poolList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "surface p-5 text-sm text-muted-foreground",
				children: "No compatible demand found yet. See below for why items were not pooled."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-2",
				children: poolList.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PoolCard, { pool: p }, p.id))
			}),
			notPooled.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
				children: [
					"Not pooled (",
					notPooled.length,
					")"
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2",
				children: notPooled.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "surface p-4 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mr-auto font-medium",
								children: a.material_name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
								tone: OUTCOME[a.outcome].tone,
								children: OUTCOME[a.outcome].label
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: [
								a.component_category,
								" · ",
								qty(a.required_quantity),
								" ",
								a.unit_of_measure,
								" · ",
								a.batch_filename,
								" row ",
								a.row_number,
								a.source_requirement_id && ` · ${a.source_requirement_id}`
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-2 list-disc space-y-0.5 pl-5 text-xs",
							children: a.reasons.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: r }, r))
						})
					]
				}, a.item_id))
			})] })
		] })
	] });
}
function PoolCard({ pool: p }) {
	const qc = useQueryClient();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const active = p.members.filter((m) => m.active);
	const c = p.constraints;
	const approval = approvalOf(p);
	async function decide(d) {
		setBusy(true);
		setError(null);
		try {
			await decidePool(p.id, d);
		} catch (e) {
			setError(describeApiError(e));
		}
		await Promise.all([invalidatePooling(qc), invalidateRequests(qc)]);
		setBusy(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface p-5",
		"aria-label": `Pool ${p.material_name}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-semibold",
					children: p.material_name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: p.component_category
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 flex-wrap justify-end gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: APPROVAL[approval].tone,
						children: APPROVAL[approval].label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
						tone: "primary",
						children: [p.member_count, " items"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 font-display text-2xl font-semibold",
				children: [
					qty(p.aggregate_quantity),
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-sm text-muted-foreground",
						children: [p.unit_of_measure, " combined"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: [
					"Pool ",
					p.id.slice(0, 8),
					" · deliver by ",
					day(p.earliest_deadline),
					p.own_member_count !== void 0 && ` · your share ${qty(p.own_quantity ?? 0)} ${p.unit_of_measure} (${p.own_member_count} of ${p.member_count} items)`
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: [
					"Combined requirements: ",
					c.minimum_quality_rating !== null ? `quality ≥ ${c.minimum_quality_rating}` : "no quality minimum",
					c.required_certifications.length > 0 && ` · ${c.required_certifications.join(", ")}`,
					c.compliance_requirements.length > 0 && ` · ${c.compliance_requirements.join(", ")}`,
					` · substitutes ${c.substitution_allowed === null ? "not specified by all" : c.substitution_allowed ? "allowed" : "not allowed"}`
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-1 border-t pt-3 text-sm",
				children: active.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate text-muted-foreground",
						children: m.own === false ? m.batch_filename : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							m.batch_filename,
							" · row ",
							m.row_number,
							m.source_requirement_id && ` · ${m.source_requirement_id}`
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "shrink-0",
						children: [
							qty(m.allocated_quantity),
							" ",
							m.unit_of_measure
						]
					})]
				}, m.item_id ?? `other-${i}`))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center gap-2 border-t pt-3",
				children: [
					approval !== "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						disabled: busy,
						onClick: () => decide("approve"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Check, { className: "size-4" }), approval === "pending" ? "Approve pooling" : "Approve instead"]
					}),
					approval !== "rejected" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						disabled: busy,
						onClick: () => decide("reject"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.X, { className: "size-4" }), approval === "pending" ? "Reject — source individually" : "Reject instead"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-xs text-muted-foreground",
						children: [approval === "approved" ? "Negotiate using agent will negotiate this combined demand with one supplier." : approval === "rejected" ? "Each requirement is negotiated on its own." : "Held back from negotiation until you decide.", p.approval_decided_at && ` Decided ${new Date(p.approval_decided_at).toLocaleString()}.`]
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-2 text-xs text-destructive",
				children: error
			})
		]
	});
}
//#endregion
export { Pooling as component };
