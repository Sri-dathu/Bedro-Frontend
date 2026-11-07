import { r as __toESM } from "../_runtime.mjs";
import { d as require_jsx_runtime, f as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as require_lucide_react } from "../_libs/lucide-react.mjs";
import { a as LoadingNotice, c as SimTag, f as describeApiError, i as ErrorNotice, m as money, n as Button, o as PageHeader, r as Empty, s as Pill } from "./query-notice-CfqlvxHB.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { D as toDate, E as syncStatusQuery, _ as negotiationQuery, a as advanceNegotiation, m as invalidateNegotiations, o as cancelNegotiation, r as STATUS_LABEL, t as MESSAGE_STATUS } from "./negotiations-BrGVm8_7.mjs";
import { t as actions } from "./store-TKTi_tzl.mjs";
import { n as Notices } from "./checks-BykImcHt.mjs";
import { t as OutcomeEmailStatus } from "./outcome-email-CtnW5_Q1.mjs";
import { a as requestQuery, i as negotiateRequest, n as REQUIREMENT_STATUS, r as invalidateRequests, s as useRequests, t as REQUEST_STATUS } from "./procurement-CAPgAIqk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workspace.negotiations-DWg44fPU.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lucide_react = require_lucide_react();
var SOURCE = {
	policy: "Buyer agent (policy)",
	llm_assisted: "Buyer agent (LLM-assisted, policy-bounded)",
	simulated_supplier: "Simulated supplier",
	supplier_reply: "Supplier email reply",
	test_reply: "Test-inbox reply (not the supplier)"
};
/** Email facts are distinct: prepared ≠ accepted by provider ≠ delivered ≠ replied. */
var COMM = {
	not_sent: "Proposal recorded — not sent",
	awaiting_authorization: "Email prepared — awaiting authorization",
	sent: "Email accepted by provider (delivery not confirmed)",
	send_failed: "Email send failed",
	outcome_unknown: "Email outcome unknown — reconcile in Supplier Communications",
	bounced: "Email bounced",
	received: "Received by email"
};
var fmt = (s) => toDate(s).toLocaleString(void 0, {
	dateStyle: "medium",
	timeStyle: "short"
});
var COUNT_LABEL = [
	["completed", "completed"],
	["active", "active"],
	["pending_review", "pending review"],
	["unresolved", "unresolved"],
	["not_started", "not started"]
];
function Negotiations() {
	const q = useRequests();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		title: "Negotiations",
		description: "One card per procurement request (uploaded requirements file). Expand a request to see its requirements, and a requirement to see its supplier negotiations. Every status comes from the backend."
	}), q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading procurement requests…" }) : q.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
		title: "Procurement requests unavailable.",
		error: q.error,
		onRetry: () => q.refetch()
	}) : q.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
		icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Handshake, { className: "size-5" }),
		title: "No procurement requests",
		body: "Upload a requirements file to create a procurement request, then negotiate it here.",
		action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/workspace/requirements",
				children: "Upload requirements"
			})
		})
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-3",
		children: q.data.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestCard, { r }, r.id))
	})] });
}
function RequestCard({ r }) {
	const qc = useQueryClient();
	const [open, setOpen] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [result, setResult] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const s = REQUEST_STATUS[r.status];
	const closed = r.status === "cancelled" || r.status === "completed" || r.status === "failed";
	async function negotiate(itemIds) {
		setBusy(true);
		setError(null);
		try {
			const res = await negotiateRequest(r.id, itemIds);
			setResult(res);
			setOpen(true);
			const { started, active, skipped, failed } = res.summary;
			const text = `${started} started · ${active} already active · ${skipped} skipped · ${failed} failed`;
			(failed ? toast.warning : toast.success)(`${res.request_ref ?? "Request"}: agent negotiation processed`, {
				id: `negotiate-${r.id}`,
				description: text
			});
		} catch (e) {
			setError(describeApiError(e));
			toast.error("Negotiation could not be started", {
				id: `negotiate-${r.id}`,
				description: describeApiError(e)
			});
		}
		await Promise.all([
			invalidateRequests(qc),
			invalidateNegotiations(qc),
			qc.invalidateQueries({ queryKey: ["email-conversations"] })
		]);
		setBusy(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface",
		"aria-label": `Procurement request ${r.request_ref ?? r.original_filename}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						className: "flex min-w-0 flex-1 items-center gap-3 text-left",
						"aria-expanded": open,
						onClick: () => setOpen((v) => !v),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ChevronDown, { className: `size-4 shrink-0 transition ${open ? "rotate-180" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "font-semibold",
								children: [
									r.request_ref ?? "Request",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "font-normal text-muted-foreground",
										children: ["· ", r.original_filename]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-xs text-muted-foreground",
								children: [
									"Uploaded ",
									fmt(r.uploaded_at),
									" · ",
									r.total_requirements,
									" requirement",
									r.total_requirements === 1 ? "" : "s",
									COUNT_LABEL.filter(([k]) => r.counts[k]).map(([k, label]) => ` · ${r.counts[k]} ${label}`).join("")
								]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: s.tone,
						children: s.label
					}),
					!closed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						disabled: busy,
						onClick: () => negotiate(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Bot, { className: "size-3.5" }), busy ? "Negotiating…" : "Negotiate Using Agent"]
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				role: "alert",
				className: "px-5 pb-3 text-sm text-destructive",
				children: error
			}),
			result && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultSummary, {
				res: result,
				onDismiss: () => setResult(null)
			}),
			open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RequestBody, {
				id: r.id,
				busy,
				onNegotiateItem: (itemId) => negotiate([itemId])
			})
		]
	});
}
function ResultSummary({ res, onDismiss }) {
	const notable = res.results;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		className: "mx-5 mb-3 rounded-xl bg-accent/60 p-3 text-xs",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "flex-1 font-medium",
				children: [
					"Agent processed ",
					res.processed,
					" requirement",
					res.processed === 1 ? "" : "s",
					":",
					" ",
					res.summary.started,
					" started, ",
					res.summary.active,
					" already active, ",
					res.summary.skipped,
					" ",
					"skipped, ",
					res.summary.failed,
					" failed."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "text-muted-foreground hover:text-foreground",
				onClick: onDismiss,
				children: "Dismiss"
			})]
		}), notable.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-2 space-y-1",
			children: notable.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: x.outcome === "failed" ? "text-destructive" : "text-muted-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: x.requirement_id ?? x.item_name
					}),
					" — ",
					x.outcome,
					x.supplier_id && ` · ${x.supplier_id}${x.offering_id ? ` / ${x.offering_id}` : ""} (${x.selection_source === "saved_selection" ? "your selection" : "agent selection"})`,
					": ",
					x.reason
				]
			}, x.item_id))
		})]
	});
}
function RequestBody({ id, busy, onNegotiateItem }) {
	const q = useQuery(requestQuery(id));
	if (q.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-t p-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading requirements…" })
	});
	if (q.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "border-t p-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
			title: "Request unavailable.",
			error: q.error,
			onRetry: () => q.refetch()
		})
	});
	if (q.data.requirements.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "border-t p-5 text-sm text-muted-foreground",
		children: "This request has no valid requirements."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "divide-y border-t",
		"aria-label": "Requirements",
		children: q.data.requirements.map((req) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Requirement, {
			req,
			busy,
			onNegotiate: () => onNegotiateItem(req.id)
		}) }, req.id))
	});
}
function Requirement({ req, busy, onNegotiate }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const s = REQUIREMENT_STATUS[req.status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "px-5 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "flex min-w-0 flex-1 items-center gap-2 text-left text-sm",
					"aria-expanded": open,
					onClick: () => setOpen((v) => !v),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ChevronDown, { className: `size-3.5 shrink-0 transition ${open ? "rotate-180" : ""}` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-medium",
							children: [
								req.requirement_id ?? `Row ${req.row_number}`,
								" · ",
								req.item_name
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-xs text-muted-foreground",
							children: [
								req.quantity.toLocaleString(),
								" ",
								req.unit,
								req.budget_per_unit !== null && ` · budget ${money(req.budget_per_unit, req.currency ?? "USD")} / unit`,
								` · ${req.negotiation_count} supplier negotiation${req.negotiation_count === 1 ? "" : "s"}`,
								req.selection ? ` · selected supplier: ${req.selection.company_name} (${req.selection.supplier_id})` : req.status === "not_started" && " · no saved selection — agent will choose"
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					tone: s.tone,
					children: s.label
				}),
				req.status === "not_started" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					disabled: busy,
					onClick: onNegotiate,
					children: "Negotiate this requirement"
				})
			]
		}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-3 space-y-2 pl-5",
			children: req.negotiations.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "No supplier negotiations yet."
			}) : req.negotiations.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupplierNegotiation, { n }, n.negotiation_id))
		})]
	});
}
function latestResponse(n) {
	const r = n.latest_response;
	if (!r) return "No supplier response yet";
	if (r.action) {
		const price = r.unit_price !== null ? ` ${money(r.unit_price, r.currency ?? n.currency)}` : "";
		return `${r.simulated ? "Simulated/test: " : ""}${r.action}${price} (round ${r.round})`;
	}
	return r.email_status ? `Reply ${MESSAGE_STATUS[r.email_status]?.label.toLowerCase() ?? r.email_status}` : "—";
}
function SupplierNegotiation({ n }) {
	const qc = useQueryClient();
	const [details, setDetails] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const s = STATUS_LABEL[n.status];
	async function cancel() {
		setBusy(true);
		setError(null);
		try {
			await cancelNegotiation(n.negotiation_id);
			toast.success(`Negotiation with ${n.supplier_name} cancelled`, {
				id: `cancel-${n.negotiation_id}`,
				description: "Other suppliers and requirements are unaffected."
			});
		} catch (e) {
			setError(describeApiError(e));
		}
		await Promise.all([invalidateNegotiations(qc), qc.invalidateQueries({ queryKey: ["email-conversations"] })]);
		setBusy(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border p-3 text-sm",
		"aria-label": `Negotiation with ${n.supplier_name}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-start gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "font-medium",
							children: [
								n.supplier_name,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-normal text-muted-foreground",
									children: [
										"· Supplier ",
										n.supplier_id,
										n.pooled && " · pooled demand"
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: [n.registered_email ?? "No registered email", n.email_problem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-destructive",
								children: [" — ", n.email_problem]
							})]
						})]
					}),
					n.mode === "simulated" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SimTag, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: s.tone,
						children: s.label
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs md:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Current price"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: n.current_price !== null ? `${money(n.current_price, n.currency)} / unit` : "—" })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Round"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", { children: [
						n.current_round,
						"/",
						n.max_rounds
					] })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Latest response"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: latestResponse(n) })] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
						className: "text-muted-foreground",
						children: "Last activity"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", { children: fmt(n.last_activity) })] })
				]
			}),
			n.reference && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-mono text-[11px] text-muted-foreground",
				children: n.reference
			}),
			n.send_problem && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "alert",
				className: "mt-1 text-xs text-destructive",
				children: ["Not emailed: ", n.send_problem]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						onClick: () => actions.openComms(n.negotiation_id),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Mail, { className: "size-3.5" }), "Open conversation"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						"aria-expanded": details,
						onClick: () => setDetails((v) => !v),
						children: details ? "Hide rounds" : "Rounds & offers"
					}),
					n.awaiting_buyer_decision && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/workspace/decision",
							children: "Review final offer"
						})
					}),
					n.can_cancel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "ghost",
						disabled: busy,
						onClick: cancel,
						children: "Cancel this supplier negotiation"
					})
				]
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "alert",
				className: "mt-1 text-sm text-destructive",
				children: [error, " Reload and try again."]
			}),
			details && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Detail, { id: n.negotiation_id })
		]
	});
}
var DECISION = {
	counteroffer: "Agent sent a counteroffer",
	accept_pending_buyer_approval: "Agreement reached — awaiting your approval",
	request_clarification: "Supplier asked a question — your reply is needed",
	escalate_to_buyer: "Needs your review — nothing was sent automatically",
	stop: "Agent stopped negotiating"
};
/** The agent's latest persisted decision: outcome and its business reason (no internal reasoning). */
function LatestDecision({ d }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border p-3",
		"aria-label": "Latest agent decision",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-medium",
					children: DECISION[d.action]
				}), d.requires_buyer_approval && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					tone: "warning",
					children: "Buyer action needed"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-xs text-muted-foreground",
				children: d.reason
			}),
			d.action === "stop" && d.alternatives.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-xs",
				children: [
					"Eligible alternatives:",
					" ",
					d.alternatives.map((a) => `${a.company_name} (${a.offering_id}, listed ${a.unit_price} ${a.currency})`).join("; ")
				]
			})
		]
	});
}
var INTENT = {
	ACCEPT_OFFER: "Accepted the offer",
	COUNTEROFFER: "Counteroffer",
	REJECT_OFFER: "Declined",
	REQUEST_CLARIFICATION: "Asked a question",
	CONDITIONAL_ACCEPTANCE: "Conditional acceptance",
	REQUEST_ADVANCE_PAYMENT: "Requests advance payment",
	REQUEST_CHANGED_QUANTITY: "Changed quantity",
	REQUEST_CHANGED_LEAD_TIME: "Changed lead time",
	SHIPPING_OR_FREIGHT_CHANGE: "Shipping/freight terms",
	WARRANTY_OR_QUALITY_CONDITION: "Warranty/quality condition",
	REQUEST_EXTENSION: "Asked for more time",
	OUT_OF_OFFICE_OR_AUTOMATED_REPLY: "Automatic / out-of-office reply",
	IRRELEVANT_MESSAGE: "Unrelated message",
	AMBIGUOUS_OR_UNKNOWN: "Unclear reply"
};
/** What the supplier's latest reply was understood to say. Tone is shown but never drives a commercial decision. */
function SupplierIntentLine({ i, currency }) {
	const terms = [
		i.unit_price && `${i.unit_price} ${i.currency ?? currency}/unit`,
		i.quantity && `qty ${i.quantity}`,
		i.lead_time_days !== null && `${i.lead_time_days} d`,
		i.payment_terms && `payment ${i.payment_terms}`,
		i.warranty,
		i.landed_cost_complete === false && i.unit_price && "landed cost incomplete"
	].filter(Boolean);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl border p-3 text-xs",
		"aria-label": "Latest supplier reply",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-medium",
						children: ["Supplier: ", INTENT[i.intent] ?? i.intent]
					}),
					i.confidence !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-muted-foreground",
						children: [
							"confidence ",
							Math.round(i.confidence * 100),
							"%"
						]
					}),
					i.sentiment && i.sentiment !== "neutral" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
						tone: "neutral",
						children: ["tone: ", i.sentiment]
					})
				]
			}),
			terms.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1",
				children: terms.join(" · ")
			}),
			i.review_reason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-warning",
				children: ["Needs review: ", i.review_reason]
			})
		]
	});
}
function Detail({ id }) {
	const qc = useQueryClient();
	const q = useQuery(negotiationQuery(id));
	const sync = useQuery(syncStatusQuery);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function run(fn) {
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
	if (q.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading negotiation…" })
	});
	if (q.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
			title: "Negotiation unavailable.",
			error: q.error,
			onRetry: () => q.refetch()
		})
	});
	const n = q.data;
	const pollEvery = sync.data?.polling_interval_seconds ?? 0;
	const rounds = [...new Set(n.offers.map((o) => o.round_number))];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 space-y-4 border-t pt-3 text-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Notices, { notices: n.notices }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					n.selection_reason,
					" · List ",
					money(n.list_unit_price, n.currency),
					" · target",
					" ",
					money(n.target_unit_price, n.currency),
					" · ceiling ",
					money(n.ceiling_unit_price, n.currency),
					" ",
					"(budget ",
					money(n.budget_per_unit, n.currency),
					")"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
							"Round",
							"From",
							"Action",
							"Unit price",
							"Lead time",
							"Total",
							"Verification"
						].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-3 py-2 font-semibold",
							children: h
						}, h)) })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y",
						children: rounds.flatMap((r) => n.offers.filter((o) => o.round_number === r)).map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "align-top",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 text-muted-foreground",
									children: o.round_number
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "px-3 py-2",
									children: [
										SOURCE[o.source],
										o.simulated && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
											tone: "warning",
											className: "ml-1",
											children: "Simulated"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1 text-xs text-muted-foreground",
											children: o.rationale
										}),
										COMM[o.communication_status] && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "text-xs text-muted-foreground",
											children: COMM[o.communication_status]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2 capitalize",
									children: o.action
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: o.unit_price !== null ? money(o.unit_price, o.currency ?? n.currency) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: o.lead_time_days !== null ? `${o.lead_time_days} d` : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: o.quoted_total !== null ? money(o.quoted_total, o.currency ?? n.currency) : "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-3 py-2",
									children: o.verification ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
										tone: o.verification.status === "verified" ? "success" : o.verification.status === "rejected" ? "danger" : "warning",
										children: o.verification.status.replace("_", " ")
									}) : "—"
								})
							]
						}, o.id))
					})]
				})
			}),
			n.recommendation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl bg-accent p-3 text-accent-foreground",
				children: n.recommendation
			}),
			n.latest_decision && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LatestDecision, { d: n.latest_decision }),
			n.latest_intent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SupplierIntentLine, {
				i: n.latest_intent,
				currency: n.currency
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OutcomeEmailStatus, { n }),
			n.status === "awaiting_supplier_response" && n.mode !== "simulated" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"Waiting for the supplier's real reply",
					!n.mode.startsWith("email") ? " (no email channel is configured)" : pollEvery > 0 ? ` — the inbox is checked every ${pollEvery}s and the agent answers valid replies automatically` : " — automatic reply processing needs inbox polling (APP_EMAIL_POLL_INTERVAL_SECONDS > 0); until then use “Check inbox” in Supplier Communications, which also runs the agent's response",
					"; nothing is simulated."
				]
			}),
			n.allowed_actions.includes("advance") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				disabled: busy,
				onClick: () => run(() => advanceNegotiation(n.id, n.current_round)),
				children: busy ? "Running…" : "Run next round (simulated)"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "alert",
				className: "text-sm text-destructive",
				children: [error, " Reload and try again."]
			})
		]
	});
}
//#endregion
export { Negotiations as component };
