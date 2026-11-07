import { d as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as require_lucide_react } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/checks-BykImcHt.js
var import_jsx_runtime = require_jsx_runtime();
var import_lucide_react = require_lucide_react();
var STYLE = {
	pass: {
		icon: import_lucide_react.Check,
		cls: "text-success"
	},
	fail: {
		icon: import_lucide_react.X,
		cls: "text-destructive"
	},
	unknown: {
		icon: import_lucide_react.HelpCircle,
		cls: "text-warning"
	},
	info: {
		icon: import_lucide_react.Info,
		cls: "text-muted-foreground"
	}
};
/** Eligibility / verification checks as recorded by the backend. `onlyIssues` hides passed checks. */
function CheckList({ checks, onlyIssues = false }) {
	const shown = onlyIssues ? checks.filter((c) => c.status !== "pass") : checks;
	if (!shown.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-1 text-xs",
		children: shown.map((c) => {
			const { icon: Icon, cls } = STYLE[c.status];
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: `flex gap-1.5 ${cls}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "mt-0.5 size-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [c.detail, !c.mandatory && c.status !== "info" && " (advisory)"] })]
			}, c.check + c.detail);
		})
	});
}
function Notices({ notices }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "space-y-1 rounded-xl bg-secondary p-3 text-xs text-muted-foreground",
		children: notices.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "flex gap-1.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.AlertCircle, { className: "mt-0.5 size-3.5 shrink-0" }), n]
		}, n))
	});
}
//#endregion
export { Notices as n, CheckList as t };
