import { r as __toESM } from "../_runtime.mjs";
import { d as require_jsx_runtime, f as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link, x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { r as GlassSegmentedControl } from "./glass-DWVj9br2.mjs";
import { t as require_lucide_react } from "../_libs/lucide-react.mjs";
import { a as LoadingNotice, f as describeApiError, i as ErrorNotice, m as money, n as Button, o as PageHeader, r as Empty, s as Pill } from "./query-notice-CfqlvxHB.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { S as saveSupplierSelection, c as communicationsQuery, h as matchesQuery, m as invalidateNegotiations, p as invalidateEmail, s as clearSupplierSelection, v as notifyMessageOutcome, w as startNegotiation } from "./negotiations-BrGVm8_7.mjs";
import { t as CheckList } from "./checks-BykImcHt.mjs";
import { r as invalidateRequests } from "./procurement-CAPgAIqk.mjs";
import { s as useRequirements } from "./requirements-BS3nigpf.mjs";
import { a as usePools } from "./pooling-CdXIbSpH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workspace.sourcing-DEfObhpp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lucide_react = require_lucide_react();
function Sourcing() {
	const req = useRequirements();
	const pools = usePools();
	const [active, setActive] = (0, import_react.useState)(null);
	const subjects = [...(pools.data ?? []).filter((p) => p.approval_status === "approved").map((p) => ({
		type: "demand_pool",
		id: p.id,
		title: p.material_name,
		sub: `Pool · ${p.aggregate_quantity.toLocaleString()} ${p.unit_of_measure} · ${p.member_count} items`
	})), ...Object.values(req.data?.items ?? {}).map((i) => ({
		type: "requirement_item",
		id: i.id,
		title: i.part,
		sub: `${i.quantity?.toLocaleString()} ${i.unit} · ${i.sourceRequirementId ?? `row ${i.rowNumber}`}`
	}))];
	const subject = subjects.find((s) => s.id === active) ?? (subjects.length === 1 ? subjects[0] : void 0);
	const header = /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Sourcing Options",
		description: "Suppliers are checked against every hard requirement first; only fully eligible suppliers are ranked, and at most three are shortlisted. Catalogue prices are indicative, not quotes."
	});
	if (req.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [header, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading requirements…" })] });
	if (req.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [header, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
		title: "Requirements unavailable.",
		error: req.error,
		onRetry: () => req.refetch()
	})] });
	if (!subjects.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [header, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Search, { className: "size-5" }),
		title: "No validated line items",
		body: "Upload requirements to see eligible suppliers.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/workspace/requirements",
				children: "Upload Requirements"
			})
		})
	})] });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [header, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-6 lg:grid-cols-[260px_1fr]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "surface h-fit p-2",
			role: "listbox",
			"aria-label": "Line items and pools",
			children: subjects.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				role: "option",
				"aria-selected": s.id === subject?.id,
				onClick: () => setActive(s.id),
				className: `w-full rounded-lg px-3 py-2 text-left text-sm transition ${s.id === subject?.id ? "bg-accent text-accent-foreground" : "hover:bg-secondary"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "truncate font-medium",
					children: s.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: s.sub
				})]
			}, s.id))
		}), subject ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubjectMatches, { subject }, subject.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "surface h-fit p-5 text-sm text-muted-foreground",
			children: "Select a line item or pool on the left. A negotiation covers only what you select: one item, or one pool and its member items."
		})]
	})] });
}
function SubjectMatches({ subject }) {
	const qc = useQueryClient();
	const nav = useNavigate();
	const q = useQuery(matchesQuery(subject.type, subject.id));
	const [view, setView] = (0, import_react.useState)("shortlist");
	const [poolSelected, setPoolSelected] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const persisted = subject.type === "requirement_item";
	const selected = persisted ? q.data?.selection?.offering_id ?? null : poolSelected;
	/** Requirement items: the choice is saved on the backend (bound to this requirement and its request) and shown only
	*  after the backend confirms it. Selecting never starts a negotiation. */
	async function choose(c) {
		if (!persisted) return setPoolSelected(c.offering_id);
		if (!q.data?.request_id || c.offering_id === selected) return;
		setBusy(true);
		setError(null);
		try {
			const sel = await saveSupplierSelection(subject.id, {
				request_id: q.data.request_id,
				offering_id: c.offering_id,
				supplier_id: c.supplier_id
			});
			qc.setQueryData(matchesQuery(subject.type, subject.id).queryKey, (old) => old ? {
				...old,
				selection: sel
			} : old);
			toast.success(`Selected supplier saved: ${sel.company_name}`, {
				id: `selection-${subject.id}`,
				description: "No negotiation was started. Use Negotiate Using Agent or Start Negotiation when ready."
			});
			await invalidateRequests(qc);
		} catch (e) {
			setError(describeApiError(e));
		}
		setBusy(false);
	}
	async function clearChoice() {
		if (!q.data?.request_id) return;
		setBusy(true);
		setError(null);
		try {
			await clearSupplierSelection(subject.id, q.data.request_id);
			qc.setQueryData(matchesQuery(subject.type, subject.id).queryKey, (old) => old ? {
				...old,
				selection: null
			} : old);
			await invalidateRequests(qc);
		} catch (e) {
			setError(describeApiError(e));
		}
		setBusy(false);
	}
	async function start(body) {
		setBusy(true);
		setError(null);
		try {
			const n = await startNegotiation({
				subject_type: subject.type,
				subject_id: subject.id,
				...body
			});
			toast.success(`Negotiation started with ${n.company_name}`, {
				id: `negotiation-${n.id}`,
				description: `Scope: ${scope} only.`
			});
			if (n.mode.startsWith("email_")) {
				const [m] = (await qc.fetchQuery(communicationsQuery(n.id))).filter((x) => x.direction === "outbound");
				if (m) notifyMessageOutcome(m);
			}
			await Promise.all([invalidateNegotiations(qc), invalidateEmail(qc)]);
			nav({ to: "/workspace/negotiations" });
		} catch (e) {
			const msg = describeApiError(e);
			setError(msg);
			setBusy(false);
			toast.error("Negotiation not started", {
				id: `start-${subject.id}`,
				description: msg
			});
		}
	}
	const scope = subject.type === "demand_pool" ? `pool “${subject.title}” (${subject.sub.split(" · ").pop()})` : `item “${subject.title}”`;
	if (q.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Checking supplier eligibility…" });
	if (q.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
		title: "Supplier matching unavailable.",
		error: q.error,
		onRetry: () => q.refetch()
	});
	const m = q.data;
	const alternatives = m.ineligible.filter((c) => c.checks.some((x) => x.check === "material" && x.status === "fail"));
	const notSelectable = [...m.needs_review, ...m.ineligible.filter((c) => !alternatives.includes(c))];
	const shortlisted = new Set(m.shortlist.map((c) => c.offering_id));
	const otherEligible = m.eligible.filter((c) => !shortlisted.has(c.offering_id));
	const stale = m.selection && m.selection.eligible === false ? m.selection : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlassSegmentedControl, {
			ariaLabel: "Sourcing view",
			size: "sm",
			value: view,
			onChange: setView,
			className: "mb-5",
			segments: [{
				value: "shortlist",
				label: `Shortlist (${m.shortlist.length})`,
				icon: import_lucide_react.Trophy
			}, {
				value: "alternatives",
				label: `Alternatives (${alternatives.length})`,
				icon: import_lucide_react.GitCompare
			}]
		}),
		view === "shortlist" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
				className: "font-semibold",
				children: ["Shortlist — ", subject.title]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					m.context.quantity.replace(/\.?0+$/, ""),
					" ",
					m.context.unit_of_measure,
					m.context.budget_per_unit ? ` · budget ${m.context.budget_per_unit.replace(/\.?0+$/, "")} ${m.context.currency} / unit` : ` · ${m.context.budget_note ?? "no budget stated"}`,
					m.context.deadline && ` · deliver by ${m.context.deadline}`
				]
			}),
			m.shortlist.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "surface mt-3 p-4 text-sm text-muted-foreground",
				children: [
					"No supplier offering passes every hard requirement.",
					" ",
					m.needs_review.length > 0 && `${m.needs_review.length} need review (see below).`
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-4 md:grid-cols-3",
				children: m.shortlist.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandidateCard, {
					c,
					recommended: true,
					selected: selected === c.offering_id,
					disabled: busy,
					onSelect: () => choose(c)
				}, c.offering_id))
			}),
			otherEligible.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-5 text-sm font-semibold",
					children: "Other eligible alternatives"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "These also pass every hard requirement but are not in the recommended shortlist. You may select one instead."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 grid gap-4 md:grid-cols-3",
					children: otherEligible.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CandidateCard, {
						c,
						selected: selected === c.offering_id,
						disabled: busy,
						onSelect: () => choose(c)
					}, c.offering_id))
				})
			] }),
			persisted && m.selection && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				children: [
					"Saved selection:",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium text-foreground",
						children: m.selection.company_name
					}),
					" (",
					m.selection.offering_id,
					"). Selecting does not start a negotiation.",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "underline",
						disabled: busy,
						onClick: clearChoice,
						children: "Clear selection"
					})
				]
			}),
			stale && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "alert",
				className: "mt-2 text-sm text-destructive",
				children: [
					"Your selected supplier ",
					stale.company_name,
					" (",
					stale.offering_id,
					") can no longer be negotiated: ",
					stale.reason,
					". Select another supplier."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 flex flex-wrap items-center gap-3",
				children: m.active_negotiation_id || m.overlapping_negotiation_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/workspace/negotiations",
						children: "View active negotiation"
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: !selected || !!stale || busy,
					onClick: () => selected && start({ offering_id: selected }),
					children: "Start Negotiation with Selected Supplier"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					disabled: !m.shortlist.length || busy,
					onClick: () => start({ auto_select: true }),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Sparkles, { className: "size-4" }), "Let the agent choose"]
				})] })
			}),
			m.overlapping_negotiation_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-warning",
				children: [
					"Some of this demand is already being negotiated",
					" ",
					subject.type === "demand_pool" ? "as an individual item" : "inside a pool",
					". Finish or cancel that negotiation first, so the same items are not negotiated twice."
				]
			}) : !m.active_negotiation_id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: [
					"Applies to ",
					scope,
					" only. No other items are negotiated."
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "mt-3 text-sm text-destructive",
				children: error
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs text-muted-foreground",
				children: [
					"Ranking:",
					" ",
					m.ranking.factors_used.map((f) => `${f} ×${m.ranking.weights[f]}`).join(", ") || "no comparable factors",
					". ",
					m.ranking.note
				]
			}),
			notSelectable.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotSelectable, { items: notSelectable })
		] }),
		view === "alternatives" && (alternatives.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "No other materials in this category."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-semibold",
				children: "Component alternatives"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Different materials in the same category. They are not evaluated as substitutes; engineering qualification is required, so they cannot be selected or negotiated for this requirement."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 grid gap-3 md:grid-cols-2",
				children: alternatives.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface p-4 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium",
						children: o.material_name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs text-muted-foreground",
						children: [
							o.company_name,
							" · ",
							o.material_grade ?? "grade not listed"
						]
					})]
				}, o.offering_id))
			})
		] }))
	] });
}
function CandidateCard({ c, selected, onSelect, recommended = false, disabled = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: onSelect,
		"aria-pressed": selected,
		disabled,
		className: `surface p-4 text-left outline-none transition duration-200 hover:-translate-y-0.5 hover:shadow-elegant active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70 ${selected ? "ring-2 ring-success" : ""}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
						tone: "primary",
						children: [
							"#",
							c.rank,
							" · Score ",
							c.score ?? "—"
						]
					}),
					recommended && c.rank === 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
						tone: "primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Sparkles, { className: "size-3" }), "Agent recommended"]
					}),
					recommended && c.rank !== 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: "Shortlisted" }),
					selected && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
						tone: "success",
						className: "ml-auto",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Check, { className: "size-3" }), "Selected Supplier"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 font-semibold",
				children: c.company_name
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-xs text-muted-foreground",
				children: [
					c.material_name,
					" · ",
					c.country_of_origin ?? "origin not listed",
					c.data_source === "sample_csv" && " · sample data"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 text-sm",
				children: [
					money(Number(c.unit_price), c.currency),
					" / ",
					c.unit_of_measure ?? "unit",
					" ·",
					" ",
					c.lead_time_days !== null ? `${c.lead_time_days} d` : "lead time not listed"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckList, { checks: c.checks.filter((x) => x.status !== "pass" || [
					"delivery_deadline",
					"minimum_order_quantity",
					"certifications"
				].includes(x.check)) })
			})
		]
	});
}
function NotSelectable({ items }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 border-t pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			className: "flex items-center gap-1.5 text-sm font-medium text-muted-foreground",
			"aria-expanded": open,
			onClick: () => setOpen((v) => !v),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ChevronDown, { className: `size-4 transition ${open ? "rotate-180" : ""}` }),
				items.length,
				" offering",
				items.length > 1 ? "s" : "",
				" not eligible or needing review"
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3 space-y-2",
			children: items.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "surface p-3 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mr-auto font-medium",
							children: [
								c.company_name,
								" · ",
								c.material_name
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: c.status === "needs_review" ? "warning" : "danger",
							children: c.status === "needs_review" ? "Needs review" : "Not eligible"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: ["Cannot currently be selected or negotiated", c.limitations.length ? `: ${c.limitations.slice(0, 3).join("; ")}` : "."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckList, {
							checks: c.checks.filter((x) => x.mandatory),
							onlyIssues: true
						})
					})
				]
			}, c.offering_id))
		})]
	});
}
//#endregion
export { Sourcing as component };
