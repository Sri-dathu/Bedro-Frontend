import { r as __toESM } from "../_runtime.mjs";
import { d as require_jsx_runtime, f as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { i as motion } from "../_libs/framer-motion+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/glass-DWVj9br2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Shared motion tokens — use these everywhere for consistent timing. */
var EASE = [
	.22,
	1,
	.36,
	1
];
var SPRING = {
	type: "spring",
	stiffness: 420,
	damping: 36,
	mass: .8
};
function GlassSegmentedControl({ segments, value, onChange, ariaLabel, className, size = "md" }) {
	const id = (0, import_react.useId)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "tablist",
		"aria-label": ariaLabel,
		className: cn("glass-capsule inline-flex max-w-full gap-1 overflow-x-auto rounded-full p-1 [scrollbar-width:none]", className),
		children: segments.map(({ value: v, label, icon: Icon }) => {
			const active = v === value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
				type: "button",
				role: "tab",
				"aria-selected": active,
				onClick: () => onChange(v),
				whileTap: { scale: .96 },
				className: cn("relative flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full font-semibold outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-ring", size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm", active ? "text-accent-foreground" : "text-muted-foreground hover:bg-card/60 hover:text-foreground"),
				children: [
					active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
						layoutId: `seg-${id}`,
						transition: SPRING,
						className: "glass-segment-active absolute inset-0 rounded-full"
					}),
					Icon && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "relative size-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "relative",
						children: label
					})
				]
			}, v);
		})
	});
}
function GlassButton({ variant = "primary", size = "md", className, children, ...p }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.button, {
		whileHover: { y: -1 },
		whileTap: { scale: .97 },
		transition: SPRING,
		className: cn("inline-flex items-center justify-center gap-2 rounded-full font-semibold outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50", size === "lg" ? "h-12 px-6 text-sm" : "h-10 px-5 text-sm", variant === "primary" ? "bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow" : "glass-capsule text-foreground hover:bg-card", className),
		...p,
		children
	});
}
//#endregion
export { SPRING as i, GlassButton as n, GlassSegmentedControl as r, EASE as t };
