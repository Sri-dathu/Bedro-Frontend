import { n as useQuery, t as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { p as fetchAllPages, u as apiRequest } from "./query-notice-CfqlvxHB.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/negotiations-BrGVm8_7.js
var MESSAGE_STATUS = {
	awaiting_authorization: {
		label: "Awaiting authorization",
		tone: "warning"
	},
	sending: {
		label: "Sending…",
		tone: "primary"
	},
	accepted_by_provider: {
		label: "Accepted by provider — awaiting reply",
		tone: "primary"
	},
	reply_received: {
		label: "Reply received",
		tone: "success"
	},
	failed: {
		label: "Send failed",
		tone: "danger"
	},
	outcome_unknown: {
		label: "Outcome unknown — reconcile",
		tone: "warning"
	},
	bounced: {
		label: "Bounced",
		tone: "danger"
	},
	cancelled: {
		label: "Cancelled before sending",
		tone: "neutral"
	},
	received: {
		label: "Received",
		tone: "primary"
	},
	processed: {
		label: "Processed",
		tone: "success"
	},
	needs_review: {
		label: "Needs review",
		tone: "warning"
	},
	late_reply: {
		label: "Late reply (no change)",
		tone: "neutral"
	},
	bounce_notice: {
		label: "Bounce notice",
		tone: "danger"
	},
	ignored: {
		label: "Dismissed",
		tone: "neutral"
	}
};
var enc$1 = encodeURIComponent;
/** Backend timestamps are UTC; values without an offset (SQLite) must not be read as local time. */
var toDate = (s) => new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(s) ? s : `${s}Z`);
var messageTime = (m) => toDate(m.sent_at ?? m.received_at ?? m.created_at);
var emailStatusQuery = queryOptions({
	queryKey: ["email-status"],
	queryFn: ({ signal }) => apiRequest("/email/status", { signal }),
	retry: false
});
var communicationsQuery = (negotiationId) => queryOptions({
	queryKey: ["communications", negotiationId],
	queryFn: ({ signal }) => apiRequest(`/negotiations/${enc$1(negotiationId)}/communications`, { signal }),
	retry: false
});
queryOptions({
	queryKey: ["email-review"],
	queryFn: ({ signal }) => apiRequest("/email/messages?review=true", { signal }),
	retry: false
});
var useEmailStatus = () => useQuery(emailStatusQuery);
/** Changes whenever a conversation gets new activity or a new item needing the buyer. */
var activitySignature = (c) => `${c.latest_at}|${c.needs_review_count}|${c.pending_send_count}|${c.negotiation_status}`;
/** Conversations needing attention that the buyer has not looked at since their last change (+ unseen unmatched). */
function unseenAttention(data, seen) {
	if (!data) return 0;
	const needs = (c) => c.needs_review_count + c.pending_send_count + (c.negotiation_status === "awaiting_buyer_decision" ? 1 : 0) > 0;
	return data.conversations.filter((c) => needs(c) && seen[c.negotiation_id] !== activitySignature(c)).length + (data.unmatched_count > 0 && seen["unmatched"] !== String(data.unmatched_count) ? 1 : 0);
}
var conversationsQuery = queryOptions({
	queryKey: ["email-conversations"],
	queryFn: ({ signal }) => apiRequest("/email/conversations", { signal }),
	retry: false
});
var unmatchedQuery = queryOptions({
	queryKey: ["email-unmatched"],
	queryFn: ({ signal }) => apiRequest("/email/messages?unmatched=true", { signal }),
	retry: false
});
var syncStatusQuery = queryOptions({
	queryKey: ["email-sync-status"],
	queryFn: ({ signal }) => apiRequest("/email/sync/status", { signal }),
	retry: false
});
var syncInbox = () => apiRequest("/email/sync", {
	method: "POST",
	timeoutMs: 6e4
});
var prepareEmail = (negotiationId) => apiRequest(`/negotiations/${enc$1(negotiationId)}/emails`, { method: "POST" });
var sendMessage = (id, confirmNotSent = false) => apiRequest(`/email/messages/${enc$1(id)}/send`, {
	method: "POST",
	body: { confirm_not_sent: confirmNotSent },
	timeoutMs: 45e3
});
var reconcileMessage = (id) => apiRequest(`/email/messages/${enc$1(id)}/reconcile`, { method: "POST" });
/** After any email change: refresh conversations, threads, review lists, sync status and negotiations. */
var invalidateEmail = (qc) => Promise.all([
	"email-conversations",
	"communications",
	"email-review",
	"email-unmatched",
	"email-sync-status",
	"negotiations",
	"negotiation",
	"procurement-requests"
].map((k) => qc.invalidateQueries({ queryKey: [k] })));
/** Toast for a backend-confirmed message outcome. Keyed by message + status, so a refresh or repeat never stacks. */
function notifyMessageOutcome(m) {
	const id = `email-${m.id}-${m.status}`;
	if (m.status === "accepted_by_provider" || m.status === "reply_received") if (m.provider === "mock") toast.success("Email recorded by the mock provider", {
		id,
		description: "Simulated: nothing left this machine."
	});
	else toast.success(m.is_test ? "Test email accepted by Gmail" : "Email accepted by Gmail", {
		id,
		description: `To ${m.to_address}${m.is_test ? " (development test inbox)" : ""}. Gmail does not confirm delivery.`
	});
	else if (m.status === "failed") toast.error("Email not sent", {
		id,
		description: m.last_error ?? "The provider rejected the message."
	});
	else if (m.status === "outcome_unknown") toast.warning("Email outcome unknown", {
		id,
		description: "It may have been sent. Reconcile in Supplier Communications before retrying."
	});
	else if (m.status === "awaiting_authorization") toast.info("Email prepared — awaiting your Send", {
		id,
		description: m.subject ?? void 0
	});
}
function notifySyncResult(r) {
	if (r.error) {
		toast.error("Inbox check failed", {
			id: "email-sync",
			description: r.error
		});
		return;
	}
	if (r.skipped) {
		toast.info("Inbox check already running", {
			id: "email-sync",
			description: "Another check (automatic or manual) is processing replies now."
		});
		return;
	}
	const parts = [
		`${r.new} new repl${r.new === 1 ? "y" : "ies"}`,
		r.processed && `${r.processed} applied to negotiations (agent responded where authorised)`,
		r.resent && `${r.resent} pending email${r.resent === 1 ? "" : "s"} sent`,
		r.reminders && `${r.reminders} reminder${r.reminders === 1 ? "" : "s"} to silent suppliers`,
		r.escalations && `${r.escalations} escalated to you`,
		r.needs_review && `${r.needs_review} need review`,
		r.ignored && `${r.ignored} unrelated ignored`
	].filter(Boolean);
	(r.needs_review ? toast.warning : toast.success)("Inbox checked", {
		id: "email-sync",
		description: parts.join(" · ")
	});
}
var enc = encodeURIComponent;
var sig = (signal) => signal ? { signal } : {};
var fetchMatches = (type, id, signal) => apiRequest(type === "demand_pool" ? `/demand-pools/${enc(id)}/supplier-matches` : `/requirement-items/${enc(id)}/supplier-matches`, sig(signal));
var fetchNegotiations = (signal) => fetchAllPages("/negotiations", signal, 200);
var fetchNegotiation = (id, signal) => apiRequest(`/negotiations/${enc(id)}`, sig(signal));
var startNegotiation = (body) => apiRequest("/negotiations", {
	method: "POST",
	body
});
/** Saves (or changes) the buyer's supplier for one requirement. Never starts a negotiation. */
var saveSupplierSelection = (itemId, body) => apiRequest(`/requirement-items/${enc(itemId)}/supplier-selection`, {
	method: "PUT",
	body
});
var clearSupplierSelection = (itemId, requestId) => apiRequest(`/requirement-items/${enc(itemId)}/supplier-selection?request_id=${enc(requestId)}`, { method: "DELETE" });
var advanceNegotiation = (id, expectedRound) => apiRequest(`/negotiations/${enc(id)}/advance`, {
	method: "POST",
	body: { expected_round: expectedRound }
});
var cancelNegotiation = (id) => apiRequest(`/negotiations/${enc(id)}/cancel`, { method: "POST" });
var decideNegotiation = (id, decision) => apiRequest(`/negotiations/${enc(id)}/decision`, {
	method: "POST",
	body: { decision }
});
var matchesQuery = (type, id) => queryOptions({
	queryKey: [
		"supplier-matches",
		type,
		id
	],
	queryFn: ({ signal }) => fetchMatches(type, id, signal),
	retry: false
});
var negotiationsQuery = queryOptions({
	queryKey: ["negotiations"],
	queryFn: ({ signal }) => fetchNegotiations(signal),
	retry: 1,
	refetchInterval: 3e4
});
var negotiationQuery = (id) => queryOptions({
	queryKey: ["negotiation", id],
	queryFn: ({ signal }) => fetchNegotiation(id, signal),
	retry: 1,
	refetchInterval: (query) => query.state.data?.status === "awaiting_supplier_response" ? 3e4 : false
});
var useNegotiations = () => useQuery(negotiationsQuery);
/** After any negotiation change, refresh lists, details, matches, requests and the email views that show the
*  outcome email (a buyer decision now sends one). */
var invalidateNegotiations = (qc) => Promise.all([
	"negotiations",
	"negotiation",
	"supplier-matches",
	"procurement-requests",
	"email-conversations",
	"communications"
].map((k) => qc.invalidateQueries({ queryKey: [k] })));
var STAGE = {
	awaiting_supplier_response: "negotiating",
	awaiting_buyer_decision: "awaiting_approval",
	manual_review_required: "needs_review",
	accepted_by_buyer: "concluded_success",
	rejected_by_buyer: "concluded_no_deal",
	supplier_rejected: "concluded_no_deal",
	no_agreement: "concluded_no_deal",
	round_limit_reached: "concluded_no_deal",
	verification_failed: "concluded_no_deal",
	cancelled: "concluded_no_deal"
};
function countByStage(list) {
	const out = {
		negotiating: 0,
		awaiting_approval: 0,
		needs_review: 0,
		concluded_success: 0,
		concluded_no_deal: 0
	};
	for (const n of list) out[STAGE[n.status] ?? "negotiating"] += 1;
	return out;
}
/** Supplier outcome-email delivery, as confirmed by the backend (never "sent" before the provider accepted it). */
var OUTCOME_EMAIL_LABEL = {
	pending: {
		label: "Pending — sent on the next inbox check",
		tone: "warning"
	},
	awaiting_authorization: {
		label: "Prepared — awaiting your Send",
		tone: "warning"
	},
	sending: {
		label: "Sending…",
		tone: "neutral"
	},
	accepted_by_provider: {
		label: "Sent",
		tone: "success"
	},
	reply_received: {
		label: "Sent",
		tone: "success"
	},
	failed: {
		label: "Failed",
		tone: "danger"
	},
	outcome_unknown: {
		label: "Awaiting provider verification",
		tone: "warning"
	},
	bounced: {
		label: "Bounced",
		tone: "danger"
	},
	cancelled: {
		label: "Cancelled",
		tone: "neutral"
	},
	not_sent: {
		label: "Not sent",
		tone: "danger"
	}
};
var STATUS_LABEL = {
	awaiting_supplier_response: {
		label: "Awaiting supplier response",
		tone: "primary"
	},
	awaiting_buyer_decision: {
		label: "Awaiting your decision",
		tone: "warning"
	},
	manual_review_required: {
		label: "Manual review required",
		tone: "warning"
	},
	accepted_by_buyer: {
		label: "Accepted by you",
		tone: "success"
	},
	rejected_by_buyer: {
		label: "Rejected by you",
		tone: "neutral"
	},
	supplier_rejected: {
		label: "Supplier rejected",
		tone: "danger"
	},
	no_agreement: {
		label: "No agreement",
		tone: "danger"
	},
	round_limit_reached: {
		label: "Round limit reached",
		tone: "danger"
	},
	verification_failed: {
		label: "Verification failed",
		tone: "danger"
	},
	cancelled: {
		label: "Cancelled",
		tone: "neutral"
	}
};
//#endregion
export { useEmailStatus as A, sendMessage as C, toDate as D, syncStatusQuery as E, unmatchedQuery as O, saveSupplierSelection as S, syncInbox as T, negotiationQuery as _, advanceNegotiation as a, prepareEmail as b, communicationsQuery as c, decideNegotiation as d, emailStatusQuery as f, messageTime as g, matchesQuery as h, activitySignature as i, useNegotiations as j, unseenAttention as k, conversationsQuery as l, invalidateNegotiations as m, OUTCOME_EMAIL_LABEL as n, cancelNegotiation as o, invalidateEmail as p, STATUS_LABEL as r, clearSupplierSelection as s, MESSAGE_STATUS as t, countByStage as u, notifyMessageOutcome as v, startNegotiation as w, reconcileMessage as x, notifySyncResult as y };
