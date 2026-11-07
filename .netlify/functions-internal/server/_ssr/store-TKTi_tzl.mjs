import { r as __toESM } from "../_runtime.mjs";
import { f as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/store-TKTi_tzl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var SEEN_KEY = "comms-seen";
function loadSeen() {
	try {
		return JSON.parse(localStorage.getItem(SEEN_KEY) ?? "{}") ?? {};
	} catch {
		return {};
	}
}
var state = {
	activity: [],
	comms: {
		open: false,
		negotiationId: null
	},
	seen: loadSeen()
};
var listeners = /* @__PURE__ */ new Set();
var set = (fn) => {
	state = fn(state);
	listeners.forEach((l) => l());
};
function useStore(sel) {
	return (0, import_react.useSyncExternalStore)((l) => (listeners.add(l), () => listeners.delete(l)), () => sel(state), () => sel(state));
}
var actions = {
	/** Records a confirmed backend outcome in this session's activity list. */
	note(text) {
		set((s) => ({
			...s,
			activity: [{
				id: crypto.randomUUID(),
				at: (/* @__PURE__ */ new Date()).toISOString(),
				text
			}, ...s.activity].slice(0, 30)
		}));
	},
	openComms(negotiationId = null) {
		set((s) => ({
			...s,
			comms: {
				open: true,
				negotiationId
			}
		}));
	},
	closeComms() {
		set((s) => ({
			...s,
			comms: {
				open: false,
				negotiationId: null
			}
		}));
	},
	/** Marks items as seen at their current activity signature; new activity changes the signature again. */
	markSeen(items) {
		if (Object.entries(items).every(([k, v]) => state.seen[k] === v)) return;
		set((s) => ({
			...s,
			seen: {
				...s.seen,
				...items
			}
		}));
		try {
			localStorage.setItem(SEEN_KEY, JSON.stringify(state.seen));
		} catch {}
	}
};
//#endregion
export { useStore as n, actions as t };
