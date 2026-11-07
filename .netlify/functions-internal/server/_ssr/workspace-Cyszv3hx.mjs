import { r as __toESM } from "../_runtime.mjs";
import { d as require_jsx_runtime, f as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link, g as Outlet, p as useRouterState } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { i as motion, o as AnimatePresence } from "../_libs/framer-motion+[...].mjs";
import { i as SPRING, t as EASE } from "./glass-DWVj9br2.mjs";
import { t as require_lucide_react } from "../_libs/lucide-react.mjs";
import { a as LoadingNotice, f as describeApiError, i as ErrorNotice, n as Button, s as Pill } from "./query-notice-CfqlvxHB.mjs";
import { n as toast, t as Toaster } from "../_libs/sonner.mjs";
import { A as useEmailStatus, C as sendMessage, D as toDate, E as syncStatusQuery, O as unmatchedQuery, T as syncInbox, _ as negotiationQuery, b as prepareEmail, c as communicationsQuery, g as messageTime, i as activitySignature, k as unseenAttention, l as conversationsQuery, m as invalidateNegotiations, p as invalidateEmail, r as STATUS_LABEL, t as MESSAGE_STATUS, v as notifyMessageOutcome, x as reconcileMessage, y as notifySyncResult } from "./negotiations-BrGVm8_7.mjs";
import { n as useStore, t as actions } from "./store-TKTi_tzl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workspace-Cyszv3hx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lucide_react = require_lucide_react();
var CHANNEL = {
	none: {
		label: "Email: not configured",
		tone: "danger"
	},
	disabled: {
		label: "Email: supplier sending disabled",
		tone: "danger"
	},
	test: {
		label: "Email: TEST MODE",
		tone: "warning"
	},
	production: {
		label: "Email: live",
		tone: "success"
	}
};
var DONE = [
	"accepted_by_provider",
	"reply_received",
	"bounced"
];
var fmt = (d) => d.toLocaleString(void 0, {
	dateStyle: "medium",
	timeStyle: "short"
});
/** Supplier Communications: one conversation per supplier negotiation (supplier ID + negotiation context), with the
* full chronological thread. Only messages the backend linked to our proposals appear; bodies are plain text. */
function CommsDrawer({ open, onClose, initialNegotiationId = null }) {
	const qc = useQueryClient();
	const status = useEmailStatus();
	const convs = useQuery({
		...conversationsQuery,
		enabled: open,
		refetchInterval: open ? 3e4 : false
	});
	const [selected, setSelected] = (0, import_react.useState)(initialNegotiationId);
	(0, import_react.useEffect)(() => {
		if (open && initialNegotiationId) setSelected(initialNegotiationId);
	}, [open, initialNegotiationId]);
	const [syncing, setSyncing] = (0, import_react.useState)(false);
	const ch = status.data?.channel;
	const list = convs.data?.conversations ?? [];
	const unmatched = convs.data?.unmatched_count ?? 0;
	const current = list.find((c) => c.negotiation_id === selected) ?? null;
	const view = selected === "unmatched" ? "unmatched" : current ? "conversation" : "none";
	(0, import_react.useEffect)(() => {
		if (!open || !convs.data) return;
		actions.markSeen({
			...Object.fromEntries(convs.data.conversations.map((c) => [c.negotiation_id, activitySignature(c)])),
			unmatched: String(convs.data.unmatched_count)
		});
	}, [open, convs.data]);
	async function sync() {
		setSyncing(true);
		try {
			notifySyncResult(await syncInbox());
		} catch (e) {
			toast.error("Inbox check failed", {
				id: "email-sync",
				description: describeApiError(e)
			});
		}
		await invalidateEmail(qc);
		setSyncing(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		className: "fixed inset-0 z-40 bg-foreground/10",
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		onClick: onClose
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.aside, {
		role: "dialog",
		"aria-label": "Supplier Communications",
		className: "glass fixed right-0 top-0 z-50 flex h-full w-full max-w-5xl flex-col p-4 md:p-6",
		initial: { x: "100%" },
		animate: { x: 0 },
		exit: { x: "100%" },
		transition: {
			type: "spring",
			damping: 32,
			stiffness: 300
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Supplier Communications"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					"aria-label": "Close",
					className: "rounded-lg p-2 hover:bg-secondary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.X, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex flex-wrap items-center gap-2",
				children: [status.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: "Email: checking…" }) : status.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					tone: "danger",
					children: "Email: backend unreachable"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
					tone: CHANNEL[ch].tone,
					children: CHANNEL[ch].label
				}), (ch === "test" || ch === "production") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					variant: "outline",
					disabled: syncing,
					onClick: sync,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.RefreshCw, { className: `size-3.5 ${syncing ? "animate-spin" : ""}` }), syncing ? "Checking inbox…" : "Check inbox"]
				})]
			}),
			status.data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChannelNote, { s: status.data }),
			(ch === "test" || ch === "production") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SyncLine, {
				open,
				syncing
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 grid min-h-0 flex-1 gap-4 md:grid-cols-[300px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					"aria-label": "Supplier conversations",
					className: `min-h-0 overflow-y-auto pr-1 ${view === "none" ? "" : "hidden md:block"}`,
					children: convs.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading conversations…" }) : convs.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
						title: "Conversations unavailable.",
						error: convs.error
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [unmatched > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setSelected("unmatched"),
						className: `mb-2 flex w-full items-center gap-2 rounded-xl p-3 text-left text-xs font-medium text-warning transition ${selected === "unmatched" ? "bg-warning/15" : "bg-warning/10 hover:bg-warning/15"}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.AlertTriangle, { className: "size-4 shrink-0" }),
							unmatched,
							" repl",
							unmatched === 1 ? "y" : "ies",
							" could not be matched to one negotiation"
						]
					}), list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "surface p-4 text-sm text-muted-foreground",
						children: "No supplier conversations yet. A conversation appears when a negotiation runs over email."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: list.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationItem, {
							c,
							active: c.negotiation_id === selected,
							onOpen: () => setSelected(c.negotiation_id)
						}) }, c.negotiation_id))
					})] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: `min-h-0 ${view === "none" ? "hidden md:block" : ""}`,
					children: view === "conversation" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConversationView, {
						c: current,
						email: status.data,
						onBack: () => setSelected(null),
						onClose
					}, current.negotiation_id) : view === "unmatched" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UnmatchedView, { onBack: () => setSelected(null) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "surface grid h-full place-items-center p-6 text-center text-sm text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Inbox, { className: "mx-auto mb-2 size-6" }), "Select a supplier conversation to see the full thread."] })
					})
				})]
			})
		]
	})] }) });
}
function ChannelNote({ s }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-2 text-xs text-muted-foreground",
		children: [
			s.message,
			s.channel !== "none" && ` Sending is authorised by: ${s.send_authorization === "agent" ? "the negotiation agent (automatic, after all checks)" : "you, per message"}.`,
			s.provider_status?.problem && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				role: "alert",
				className: "mt-1 block font-medium text-destructive",
				children: s.provider_status.problem
			})
		]
	});
}
var VERB = {
	offer: "offered",
	counteroffer: "countered",
	accept: "accepted",
	reject: "rejected"
};
var EMAILED = {
	sent: "emailed",
	awaiting_authorization: "email awaiting your Send",
	send_failed: "email failed",
	outcome_unknown: "email outcome unknown",
	bounced: "email bounced",
	not_sent: "not emailed"
};
var NEXT = {
	awaiting_supplier_response: "Next: waiting for the supplier's reply — the agent answers valid replies when the inbox is checked.",
	awaiting_buyer_decision: "Next: the final offer passed verification — your decision is needed in Sourcing Decision.",
	manual_review_required: "Next: manual review is required; the offer cannot be accepted as is."
};
function offerLine(o, currency) {
	const who = o.party === "buyer" ? o.source === "llm_assisted" ? "BEDRO agent (AI-assisted, within your limits)" : "BEDRO agent" : o.source === "test_reply" ? "Test-inbox reply" : o.source === "simulated_supplier" ? "Simulated supplier" : "Supplier";
	const price = o.unit_price !== null ? ` ${o.unit_price} ${o.currency ?? currency} per unit` : "";
	const lead = o.lead_time_days !== null ? `, ${o.lead_time_days} days` : "";
	const mail = o.party === "buyer" && EMAILED[o.communication_status] ? ` · ${EMAILED[o.communication_status]}` : "";
	return `${who} ${VERB[o.action] ?? o.action}${price}${lead}${mail}`;
}
/** Business summary of the negotiation behind a conversation: each round's offer and answer, and what happens next. */
function NegotiationSummary({ id }) {
	const q = useQuery(negotiationQuery(id));
	if (!q.data) return null;
	const n = q.data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Negotiation summary",
		className: "max-h-48 overflow-y-auto border-b bg-accent/40 p-4 text-xs",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
				className: "mb-2 font-semibold uppercase tracking-wider text-muted-foreground",
				children: "Negotiation summary"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-1",
				children: n.offers.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "w-7 shrink-0 text-muted-foreground",
						children: ["R", o.round_number]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: offerLine(o, n.currency) })]
				}, o.id))
			}),
			n.recommendation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2",
				children: n.recommendation
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 font-medium",
				children: NEXT[n.status] ?? STATUS_LABEL[n.status].label
			})
		]
	});
}
function SyncLine({ open, syncing }) {
	const q = useQuery({
		...syncStatusQuery,
		enabled: open
	});
	if (syncing) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		role: "status",
		className: "mt-1 text-xs",
		children: "Checking the inbox for supplier replies…"
	});
	if (!q.data) return null;
	const { last_run: r, last_success: ok, polling_interval_seconds: every } = q.data;
	const auto = every > 0 ? `Checked automatically every ${every}s; the agent answers valid replies.` : "Automatic checking is off (set APP_EMAIL_POLL_INTERVAL_SECONDS) — use Check inbox.";
	if (!r) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		className: "mt-1 text-xs text-muted-foreground",
		children: ["Inbox not checked yet. ", auto]
	});
	const c = r.counts;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		role: "status",
		className: `mt-1 text-xs ${r.status === "error" ? "text-destructive" : "text-muted-foreground"}`,
		children: [
			r.status === "error" ? `Last check failed (${fmt(toDate(r.started_at))}): ${r.error}.${ok ? ` Last successful check: ${fmt(toDate(ok.finished_at ?? ok.started_at))}.` : ""}` : `Last checked ${fmt(toDate(r.finished_at ?? r.started_at))}: ${c.new ?? 0} new, ${c.processed ?? 0} applied, ${c.needs_review ?? 0} need review, ${c.ignored ?? 0} unrelated ignored.`,
			" ",
			auto
		]
	});
}
/** "PR-2026-001 · R-1, R-2": the procurement request(s) and requirement(s) this negotiation serves. */
function requestLabel(c) {
	return (c.requests ?? []).map((r) => {
		const reqs = r.requirements.map((q) => q.requirement_id ?? `row ${q.row_number}`).join(", ");
		return `${r.request_ref ?? "Request"}${reqs ? ` · ${reqs}` : ""}`;
	}).join(" | ");
}
function ConversationItem({ c, active, onOpen }) {
	const s = STATUS_LABEL[c.negotiation_status] ?? {
		label: c.negotiation_status,
		tone: "neutral"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		onClick: onOpen,
		"aria-current": active,
		className: `surface w-full p-3 text-left text-sm transition ${active ? "ring-2 ring-primary" : "hover:-translate-y-0.5"}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex items-baseline gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "min-w-0 flex-1 truncate font-semibold",
					children: c.company_name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
					className: "shrink-0 text-[11px] text-muted-foreground",
					children: fmt(toDate(c.latest_at))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "block truncate text-xs text-muted-foreground",
				children: [
					"Supplier ",
					c.supplier_id,
					" · ",
					c.material_name,
					" · ",
					c.scope_label
				]
			}),
			requestLabel(c) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-[11px] text-muted-foreground",
				children: requestLabel(c)
			}),
			c.reference && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate font-mono text-[11px] text-muted-foreground",
				children: c.reference
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-1 block truncate text-xs",
				children: c.latest ? `${c.latest.direction === "outbound" ? "BEDRO: " : "Supplier: "}${c.latest.preview}` : "No messages yet"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "mt-2 flex flex-wrap gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: s.tone,
						children: s.label
					}),
					c.needs_review_count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
						tone: "warning",
						children: [c.needs_review_count, " need review"]
					}),
					c.pending_send_count > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
						tone: "warning",
						children: [c.pending_send_count, " not sent"]
					}),
					c.is_test && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: "warning",
						children: "Test inbox"
					})
				]
			})
		]
	});
}
function ConversationView({ c, email, onBack, onClose }) {
	const q = useQuery(communicationsQuery(c.negotiation_id));
	const s = STATUS_LABEL[c.negotiation_status] ?? {
		label: c.negotiation_status,
		tone: "neutral"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface flex h-full min-h-0 flex-col",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-start gap-2 border-b p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onBack,
						"aria-label": "Back to conversations",
						className: "rounded-lg p-1.5 hover:bg-secondary md:hidden",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowLeft, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-semibold",
							children: [
								c.company_name,
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-normal text-muted-foreground",
									children: ["· Supplier ", c.supplier_id]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted-foreground",
							children: [
								requestLabel(c) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [requestLabel(c), " · "] }),
								c.material_name,
								" · ",
								c.scope_label,
								" · round ",
								c.current_round,
								"/",
								c.max_rounds,
								c.reference && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									" ",
									"· ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "font-mono",
										children: c.reference
									})
								] })
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: s.tone,
						children: s.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/workspace/negotiations",
							onClick: onClose,
							children: "Negotiation details"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NegotiationSummary, { id: c.negotiation_id }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "min-h-0 flex-1 overflow-y-auto p-4",
				children: q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading messages…" }) : q.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
					title: "Messages unavailable.",
					error: q.error
				}) : q.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "No messages in this conversation yet."
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "space-y-3",
					"aria-label": "Messages, oldest first",
					children: q.data.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageBubble, { m }, m.id))
				})
			}),
			q.data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProposalComposer, {
				c,
				email,
				msgs: q.data
			})
		]
	});
}
function UnmatchedView({ onBack }) {
	const q = useQuery(unmatchedQuery);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "surface flex h-full min-h-0 flex-col",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-start gap-2 border-b p-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onBack,
				"aria-label": "Back to conversations",
				className: "rounded-lg p-1.5 hover:bg-secondary md:hidden",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowLeft, { className: "size-4" })
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-semibold",
				children: "Unmatched replies"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: "These replies refer to our proposals but cannot be tied to exactly one negotiation, so they changed nothing."
			})] })]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1 overflow-y-auto p-4",
			children: q.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading…" }) : q.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
				title: "Unmatched replies unavailable.",
				error: q.error
			}) : q.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Nothing to review."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "space-y-3",
				children: q.data.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageBubble, { m }, m.id))
			})
		})]
	});
}
function sender(m) {
	if (m.direction === "outbound") return m.authorized_by === "buyer" ? "Procurement team (sent by you)" : m.authorized_by === "negotiation_agent" ? "BEDRO agent" : "BEDRO agent (not sent yet)";
	return `${m.is_test ? "Test-inbox tester" : "Supplier"} · ${m.from_address ?? "unknown sender"}`;
}
function MessageBubble({ m }) {
	const qc = useQueryClient();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const out = m.direction === "outbound";
	const s = MESSAGE_STATUS[m.status] ?? {
		label: m.status,
		tone: "neutral"
	};
	async function act(fn) {
		setBusy(true);
		setError(null);
		try {
			notifyMessageOutcome(await fn());
		} catch (e) {
			const msg = describeApiError(e);
			setError(msg);
			toast.error("Email action failed", {
				id: `email-${m.id}-error`,
				description: msg
			});
		}
		await invalidateEmail(qc);
		setBusy(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		className: `flex ${out ? "justify-end" : "justify-start"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
			"aria-label": `${out ? "Outgoing" : "Incoming"} message`,
			className: `w-full max-w-[88%] rounded-2xl p-3 text-sm ${out ? "rounded-br-sm bg-primary/10" : "rounded-bl-sm bg-secondary"} ${m.linked === false ? "border border-dashed border-warning" : ""}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-1.5 text-xs",
					children: [
						out ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowUpRight, { className: "size-3.5 text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowDownLeft, { className: "size-3.5 text-success" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: sender(m)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
							className: "ml-auto text-[11px] text-muted-foreground",
							children: fmt(messageTime(m))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1.5 flex flex-wrap gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: s.tone,
							children: s.label
						}),
						m.is_test && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: "warning",
							children: "Test inbox"
						}),
						m.provider === "mock" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: "Mock provider — simulated" }),
						m.linked === false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: "warning",
							children: "Not applied to the negotiation"
						})
					]
				}),
				m.subject && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 text-xs font-medium",
					children: m.subject
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-[11px] text-muted-foreground",
					children: [out ? `to ${m.to_address}` : `to ${m.to_address ?? "our mailbox"}`, m.reference_token && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						" ",
						"· ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono",
							children: m.reference_token
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words font-sans text-xs",
					children: m.body_text
				}),
				m.review_reason && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 text-xs text-warning",
					children: ["Needs review: ", m.review_reason]
				}),
				m.last_error && !DONE.includes(m.status) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-1 text-xs text-destructive",
					children: m.last_error
				}),
				out && [
					"awaiting_authorization",
					"failed",
					"outcome_unknown"
				].includes(m.status) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-wrap gap-2",
					children: m.status !== "outcome_unknown" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						disabled: busy,
						onClick: () => act(() => sendMessage(m.id)),
						children: m.status === "failed" ? "Retry send" : "Send email"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						variant: "outline",
						disabled: busy,
						onClick: () => act(() => reconcileMessage(m.id)),
						children: "Reconcile"
					})
				}),
				error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					role: "alert",
					className: "mt-1 text-xs text-destructive",
					children: error
				})
			]
		})
	});
}
/** Emails the negotiation's CURRENT proposal. Terms come from the persisted offer and the recipient is chosen by
* the backend (test inbox in test mode), so nothing typed here can change prices or redirect mail. */
function ProposalComposer({ c, email, msgs }) {
	const qc = useQueryClient();
	const neg = useQuery(negotiationQuery(c.negotiation_id));
	const [busy, setBusy] = (0, import_react.useState)(false);
	const n = neg.data;
	if (!n || n.status !== "awaiting_supplier_response" || !c.mode.startsWith("email_")) return null;
	const offer = n.offers.find((o) => o.party === "buyer" && o.round_number === n.current_round);
	if (!offer) return null;
	const existing = msgs.find((m) => m.direction === "outbound" && m.negotiation_offer_id === offer.id);
	async function emailProposal() {
		setBusy(true);
		try {
			const prepared = await prepareEmail(c.negotiation_id);
			notifyMessageOutcome(DONE.includes(prepared.status) ? prepared : await sendMessage(prepared.id));
		} catch (e) {
			toast.error("Email not sent", {
				id: `compose-${c.negotiation_id}`,
				description: describeApiError(e)
			});
		}
		await invalidateEmail(qc);
		setBusy(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "border-t p-4 text-xs",
		children: [existing && DONE.includes(existing.status) ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-muted-foreground",
			children: [
				"Round ",
				offer.round_number,
				" proposal was emailed. Waiting for the supplier's reply — use Check inbox to look for it."
			]
		}) : existing ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "text-muted-foreground",
			children: [
				"The round ",
				offer.round_number,
				" proposal is prepared above: use its Send button."
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "min-w-0 flex-1 text-muted-foreground",
				children: [
					"Round ",
					offer.round_number,
					" proposal: ",
					offer.unit_price,
					" ",
					offer.currency,
					" per unit ×",
					" ",
					offer.quantity,
					" ",
					offer.unit_of_measure,
					offer.lead_time_days !== null && `, delivery within ${offer.lead_time_days} days`,
					".",
					" ",
					email?.test_mode ? `Goes only to the test inbox ${email.test_recipient}.` : "Goes to the supplier's verified contact."
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				disabled: busy,
				onClick: emailProposal,
				children: busy ? "Sending…" : "Email this proposal"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-[11px] text-muted-foreground",
			children: "Supplier emails are generated from the negotiation's recorded proposal, so terms always match it. Free-text messages are not supported."
		})]
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var NAV = [
	{
		to: "/workspace",
		label: "Overview",
		icon: import_lucide_react.LayoutDashboard
	},
	{
		to: "/workspace/requirements",
		label: "Requirements",
		icon: import_lucide_react.FileUp
	},
	{
		to: "/workspace/pooling",
		label: "Demand Pooling",
		icon: import_lucide_react.Layers
	},
	{
		to: "/workspace/sourcing",
		label: "Sourcing Options",
		icon: import_lucide_react.Search
	},
	{
		to: "/workspace/negotiations",
		label: "Negotiations",
		icon: import_lucide_react.Handshake
	},
	{
		to: "/workspace/decision",
		label: "Sourcing Decision",
		icon: import_lucide_react.CheckCircle2
	}
];
function NavList({ onNav }) {
	const path = useRouterState({ select: (s) => s.location.pathname });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "flex flex-col gap-1",
		children: NAV.map(({ to, label, icon: Icon }) => {
			const active = to === "/workspace" ? path === "/workspace" || path === "/workspace/" : path.startsWith(to);
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to,
				onClick: onNav,
				className: `group relative flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium outline-none transition-[color,background-color,transform] duration-200 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-ring ${active ? "font-semibold text-accent-foreground" : "text-muted-foreground hover:bg-card/70 hover:text-foreground"}`,
				children: [
					active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
						layoutId: "nav-active",
						className: "glass-segment-active absolute inset-0 rounded-full",
						transition: SPRING
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `relative size-4 transition-transform duration-200 ${active ? "text-primary" : "group-hover:translate-x-0.5"}` }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "relative",
						children: label
					})
				]
			}, to);
		})
	});
}
/** The backend advances negotiations by itself (inbox polling, agent replies, outcome emails). When any
*  conversation shows new activity, refresh every view derived from negotiations so pages stay consistent. */
function useBackendActivitySync(data) {
	const qc = useQueryClient();
	const last = (0, import_react.useRef)(null);
	const sig = data ? data.conversations.map(activitySignature).sort().join(";") : null;
	(0, import_react.useEffect)(() => {
		if (sig === null) return;
		if (last.current !== null && last.current !== sig) invalidateNegotiations(qc);
		last.current = sig;
	}, [sig, qc]);
}
function WorkspaceLayout() {
	const [mobile, setMobile] = (0, import_react.useState)(false);
	const comms = useStore((s) => s.comms);
	const path = useRouterState({ select: (s) => s.location.pathname });
	const convs = useQuery({
		...conversationsQuery,
		refetchInterval: 3e4
	});
	useBackendActivitySync(convs.data);
	const seen = useStore((s) => s.seen);
	const attention = unseenAttention(convs.data, seen);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background bg-gradient-hero",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "glass fixed inset-y-3 left-3 z-30 hidden w-60 flex-col rounded-3xl p-4 lg:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "mb-8 px-2 font-display text-xl font-bold tracking-tight",
						children: ["BEDRO", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-primary",
							children: "."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavList, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-auto rounded-2xl bg-secondary p-3 text-xs text-muted-foreground",
						children: "Development build. Service status is shown on the Overview and in Supplier Communications."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "glass sticky top-0 z-20 flex h-16 items-center gap-3 px-4 lg:ml-[264px] lg:mr-3 lg:mt-3 lg:rounded-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "rounded-lg p-2 hover:bg-secondary lg:hidden",
						"aria-label": "Open navigation",
						onClick: () => setMobile(true),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Menu, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display font-bold lg:hidden",
						children: "BEDRO"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "hidden text-sm text-muted-foreground lg:block",
						children: "Procurement Workspace"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => actions.openComms(),
						"aria-label": `Supplier Communications${attention ? ` (${attention} need attention)` : ""}`,
						className: "glass-capsule relative ml-auto grid size-10 place-items-center rounded-full text-muted-foreground transition hover:text-foreground active:scale-95 focus-visible:ring-2 focus-visible:ring-ring outline-none",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Mail, { className: "size-5" }), attention > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: "absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground",
							children: attention
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: mobile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				className: "fixed inset-0 z-40 bg-foreground/10 lg:hidden",
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				onClick: () => setMobile(false)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.aside, {
				className: "glass fixed inset-y-0 left-0 z-50 w-72 p-4 lg:hidden",
				initial: { x: "-100%" },
				animate: { x: 0 },
				exit: { x: "-100%" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex items-center justify-between px-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-xl font-bold",
						children: "BEDRO"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						"aria-label": "Close navigation",
						onClick: () => setMobile(false),
						className: "rounded-lg p-2 hover:bg-secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.X, { className: "size-4" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavList, { onNav: () => setMobile(false) })]
			})] }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "px-4 py-8 lg:ml-[264px] lg:px-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: {
						opacity: 0,
						y: 8
					},
					animate: {
						opacity: 1,
						y: 0
					},
					transition: {
						duration: .35,
						ease: EASE
					},
					className: "mx-auto max-w-6xl",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				}, path)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommsDrawer, {
				open: comms.open,
				initialNegotiationId: comms.negotiationId,
				onClose: actions.closeComms
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
				position: "top-right",
				richColors: true,
				closeButton: true
			})
		]
	});
}
//#endregion
export { WorkspaceLayout as component };
