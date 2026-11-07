import { r as __toESM } from "../_runtime.mjs";
import { d as require_jsx_runtime, f as require_react } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as MotionConfig, i as motion, n as useTransform, o as AnimatePresence, r as useScroll, t as useReducedMotion } from "../_libs/framer-motion+[...].mjs";
import { n as GlassButton, t as EASE } from "./glass-DWVj9br2.mjs";
import { t as require_lucide_react } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CZDOFA6S.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lucide_react = require_lucide_react();
var CORES = [
	{
		icon: import_lucide_react.FileSearch,
		title: "Specification",
		detail: "Every row parsed and validated"
	},
	{
		icon: import_lucide_react.Layers,
		title: "Demand pooling",
		detail: "Compatible demand only"
	},
	{
		icon: import_lucide_react.Search,
		title: "Supplier discovery",
		detail: "Shortlist with concrete gaps"
	},
	{
		icon: import_lucide_react.Handshake,
		title: "Negotiation",
		detail: "Email rounds, you approve"
	}
];
var TRACES = [
	"M50 50 H38 V27 H32",
	"M50 50 H62 V27 H68",
	"M50 50 H38 V73 H32",
	"M50 50 H62 V73 H68"
];
/** Hero visual: a semiconductor die whose four cores are BEDRO's intelligence engines. Pure SVG/CSS — no images. */
function EngineDie() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			scale: .96
		},
		animate: {
			opacity: 1,
			scale: 1
		},
		transition: {
			duration: .9,
			delay: .45,
			ease: EASE
		},
		className: "engine-die relative mx-auto aspect-square w-full max-w-[460px]",
		"aria-label": "BEDRO intelligence engines",
		role: "img",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "die-pins die-pins-x absolute inset-x-[16%] top-[3%] h-[6%]",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "die-pins die-pins-x absolute inset-x-[16%] bottom-[3%] h-[6%]",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "die-pins die-pins-y absolute inset-y-[16%] left-[3%] w-[6%]",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "die-pins die-pins-y absolute inset-y-[16%] right-[3%] w-[6%]",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "die-body absolute inset-[9%] rounded-[30px]",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
						viewBox: "0 0 100 100",
						className: "pointer-events-none absolute inset-0 size-full",
						"aria-hidden": true,
						children: TRACES.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.path, {
							d,
							fill: "none",
							stroke: "var(--primary)",
							strokeOpacity: "0.45",
							strokeWidth: "0.6",
							strokeLinecap: "round",
							initial: { pathLength: 0 },
							animate: { pathLength: 1 },
							transition: {
								duration: .9,
								delay: 1 + i * .12,
								ease: EASE
							}
						}, d))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative grid size-full grid-cols-2 gap-[19%] p-[6%]",
						children: CORES.map(({ icon: Icon, title, detail }, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: {
								opacity: 0,
								y: 10
							},
							animate: {
								opacity: 1,
								y: 0
							},
							transition: {
								duration: .55,
								delay: .75 + i * .1,
								ease: EASE
							},
							className: "die-core flex flex-col justify-between rounded-2xl p-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-4.5",
									"aria-hidden": true
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm font-semibold leading-tight",
								children: title
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-0.5 block text-[11px] leading-snug text-muted-foreground",
								children: detail
							})] })]
						}, title))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						initial: {
							opacity: 0,
							scale: .8
						},
						animate: {
							opacity: 1,
							scale: 1
						},
						transition: {
							duration: .6,
							delay: 1.25,
							ease: EASE
						},
						className: "die-center absolute left-1/2 top-1/2 grid size-[16%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl text-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground",
							children: [
								"Agent",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								"core"
							]
						})
					})
				]
			})
		]
	});
}
var MicroSlats = (0, import_react.lazy)(() => import("./MicroSlats-D3YJpk9n.mjs"));
/** Hero entrance timing, coordinated with the landing navbar (which enters at 0–0.5 s). */
var up = (d) => ({
	initial: {
		opacity: 0,
		y: 16
	},
	animate: {
		opacity: 1,
		y: 0
	},
	transition: {
		duration: .7,
		delay: d,
		ease: EASE
	}
});
function Hero({ go }) {
	const lines = [[
		"BUY",
		"LIKE",
		"AN",
		"ENTERPRISE."
	], [
		"COMPETE",
		"ON",
		"YOUR",
		"TERMS."
	]];
	const ref = (0, import_react.useRef)(null);
	const reduce = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end start"]
	});
	const copyY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -50]);
	const visualY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -110]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		ref,
		id: "engines",
		"aria-label": "Intelligence engines",
		className: "hero relative isolate flex min-h-[600px] items-center overflow-hidden pb-20 pt-28 md:min-h-[700px] md:pt-32",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hero-background absolute inset-0 -z-20",
				"aria-hidden": true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
					fallback: null,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MicroSlats, {
						preset: "storm",
						color: "#fcfcfc",
						glintColor: "#8ea7d2",
						backgroundColor: "#c5cecc",
						slatWidth: 10,
						slatHeight: 25,
						gap: 3,
						roundness: .75,
						interactive: true,
						cursorStrength: 1,
						cursorSize: 40,
						swirl: 0,
						trail: 1.4,
						lean: 0,
						intro: true,
						scale: .55,
						speed: 1.6,
						direction: 236,
						chop: 1,
						stretch: .3,
						glint: 1.3,
						contrast: 1.8,
						perspective: .8,
						fog: .35
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hero-veil pointer-events-none absolute inset-0 -z-10",
				"aria-hidden": true
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto grid w-full max-w-6xl items-center gap-12 px-5 lg:grid-cols-[1.08fr_0.92fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					style: { y: copyY },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
							...up(.2),
							className: "glass-capsule inline-flex rounded-full px-3.5 py-1.5 text-xs font-semibold text-accent-foreground",
							children: "Intelligence engines · Semiconductor procurement"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-6 text-[2.5rem] font-extrabold leading-[0.98] text-foreground sm:text-6xl md:text-7xl",
							children: lines.map((ws, li) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `block ${li ? "text-gradient" : ""}`,
								children: ws.map((w, wi) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "inline-block overflow-hidden pb-1 align-bottom",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.span, {
										className: "inline-block",
										initial: { y: "105%" },
										animate: { y: 0 },
										transition: {
											duration: .8,
											delay: .3 + li * .16 + wi * .05,
											ease: EASE
										},
										children: [w, "\xA0"]
									})
								}, w))
							}, li))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
							...up(.75),
							className: "mt-6 max-w-lg text-lg text-foreground/75",
							children: "Four intelligence engines read your requirement files, pool compatible demand, qualify suppliers and negotiate by email — then hand every award to you for the final decision."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 flex flex-wrap gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								...up(.9),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/workspace",
									className: "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-elegant outline-none transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-glow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
									children: ["Explore the Procurement Workspace ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowRight, { className: "size-4" })]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								...up(1),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlassButton, {
									size: "lg",
									variant: "glass",
									onClick: () => go("how"),
									children: "How It Works"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.p, {
							...up(1.1),
							className: "mt-6 flex items-center gap-2 text-sm text-foreground/70",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ShieldCheck, {
								className: "size-4 text-primary",
								"aria-hidden": true
							}), "Every award requires your approval. Budgets and price ceilings are never shared with suppliers."]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					style: { y: visualY },
					className: "hidden md:block",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EngineDie, {})
				})]
			})
		]
	});
}
var MetallicPaint = (0, import_react.lazy)(() => import("./MetallicPaint-DaMaMum-.mjs"));
function TextMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "font-display text-lg font-bold tracking-tight",
		children: "BEDRO"
	});
}
function webgl2() {
	if (typeof WebGL2RenderingContext === "undefined") return false;
	try {
		return !!document.createElement("canvas").getContext("webgl2");
	} catch {
		return false;
	}
}
/** Static metallic BEDRO wordmark (with the brand's blue full stop). Falls back to the text wordmark when WebGL2 is
*  unavailable, during server rendering, and while the component loads — same box, so nothing shifts. */
function BrandWordmark() {
	const [metal, setMetal] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMetal(webgl2()), []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "flex items-end",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `relative inline-flex items-center ${metal ? "h-7 w-[86px]" : ""}`,
				"aria-hidden": metal || void 0,
				children: metal ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
					fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextMark, {}),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetallicPaint, {
						text: "BEDRO",
						fontFamily: "Sora, ui-sans-serif, system-ui, sans-serif",
						fontWeight: 800,
						color: "#c9d6ea",
						backgroundColor: "transparent",
						lightMode: true,
						density: 2,
						softness: .1,
						dispersion: .25,
						distortion: .05,
						edgeBend: .6,
						angle: 70,
						scale: 1,
						speed: 0,
						paused: true,
						intro: false,
						mouseTilt: 0
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TextMark, {})
			}),
			metal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "BEDRO"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: `font-display text-lg font-bold leading-none text-primary relative ${metal ? "mb-1" : "mb-[3px]"}`,
				"aria-hidden": true,
				children: "."
			})
		]
	});
}
/** Shared landing-page motion: one easing, one duration scale, reveal once when ~15% is visible. */
var reveal = {
	initial: {
		opacity: 0,
		y: 24
	},
	whileInView: {
		opacity: 1,
		y: 0
	},
	viewport: {
		once: true,
		amount: .15
	},
	transition: {
		duration: .6,
		ease: EASE
	}
};
var revealDelay = (i, step = .08) => ({
	...reveal,
	transition: {
		...reveal.transition,
		delay: i * step
	}
});
/** Smooth-scroll to a landing section (instant when the visitor prefers reduced motion). */
var scrollToSection = (id) => document.getElementById(id)?.scrollIntoView({
	behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
	block: "start"
});
/** Section heading block used by every landing section. */
var eyebrow = "text-xs font-bold uppercase tracking-[0.18em] text-primary";
var SIDEBAR = [
	[import_lucide_react.LayoutDashboard, "Overview"],
	[import_lucide_react.FileUp, "Requirements"],
	[import_lucide_react.Layers, "Demand Pooling"],
	[import_lucide_react.Search, "Sourcing Options"],
	[import_lucide_react.Handshake, "Negotiations"],
	[import_lucide_react.CheckCircle2, "Sourcing Decision"]
];
var ROWS = [
	[
		"300 mm P-type wafer",
		"500 wafers",
		"Validated"
	],
	[
		"Photoresist KrF",
		"40 L",
		"Validated"
	],
	[
		"Bonding wire Au 25 µm",
		"12 km",
		"Needs review"
	]
];
var SHORTLIST = [
	[
		"Supplier A",
		92,
		"Meets all checks"
	],
	[
		"Supplier B",
		87,
		"Lead time 42 d"
	],
	[
		"Supplier C",
		81,
		"MOQ 1,000"
	]
];
var TIMELINE = [
	["R1", "Opening proposal sent"],
	["R1", "Supplier counteroffer read"],
	["R2", "Agent counteroffer sent"],
	["R2", "Supplier accepts — awaiting you"]
];
var POINTS = [
	[
		import_lucide_react.FileUp,
		"Every upload is its own request",
		"Each CSV or XLSX becomes a separate procurement request with its own lifecycle and history."
	],
	[
		import_lucide_react.Search,
		"Evidence, not scores",
		"Shortlists show the concrete gaps — MOQ, stock, lead time, compliance — behind each supplier."
	],
	[
		import_lucide_react.ShieldCheck,
		"You make the call",
		"The agent negotiates within your limits; nothing is awarded until you approve the final offer."
	]
];
/** Homepage preview of the procurement workspace (marketing illustration — the real workspace lives at /workspace). */
function WorkspaceShowcase() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "workspace",
		"aria-labelledby": "workspace-title",
		className: "relative overflow-hidden px-5 py-24 md:py-32",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "section-glow pointer-events-none absolute inset-x-0 top-0 h-[480px]",
			"aria-hidden": true
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative mx-auto max-w-6xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					...reveal,
					className: "flex flex-wrap items-end justify-between gap-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: eyebrow,
								children: "Procurement workspace"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								id: "workspace-title",
								className: "mt-3 text-4xl font-bold md:text-5xl",
								children: "From requirement file to sourcing decision — in one workspace."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-lg text-muted-foreground",
								children: "Upload requirements, compare qualified suppliers, follow every negotiation round and approve the outcome, with the full supplier conversation beside it."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/workspace",
						className: "inline-flex h-12 items-center gap-2 rounded-full bg-gradient-primary px-6 text-sm font-semibold text-primary-foreground shadow-elegant outline-none transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-glow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
						children: ["Open Procurement Workspace ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowRight, { className: "size-4" })]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					...revealDelay(1),
					className: "preview-frame mt-12 overflow-hidden rounded-[28px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 border-b border-border/60 px-5 py-3",
						children: [
							[
								"bg-red-300",
								"bg-amber-300",
								"bg-emerald-300"
							].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `size-2.5 rounded-full ${c}`,
								"aria-hidden": true
							}, c)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-3 text-xs font-medium text-muted-foreground",
								children: "Procurement Workspace"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ml-auto rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold text-accent-foreground",
								children: "Illustrative preview"
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid md:grid-cols-[190px_1fr]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "hidden space-y-1 border-r border-border/60 p-3 md:block",
							"aria-hidden": true,
							children: SIDEBAR.map(([Icon, l], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: `flex items-center gap-2.5 rounded-full px-3 py-2 text-xs font-medium ${i === 4 ? "glass-segment-active text-accent-foreground" : "text-muted-foreground"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: `size-3.5 ${i === 4 ? "text-primary" : ""}` }), l]
							}, l))
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 p-4 md:p-6 lg:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
									title: "Request PR-2026-014",
									tag: "3 requirements",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "divide-y divide-border/60 text-xs",
										children: ROWS.map(([m, q, s]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center justify-between gap-3 py-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "min-w-0 truncate font-medium",
												children: m
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "flex shrink-0 items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "text-muted-foreground",
													children: q
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `rounded-full px-2 py-0.5 text-[10px] font-semibold ${s === "Validated" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`,
													children: s
												})]
											})]
										}, m))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
									title: "Shortlisted suppliers",
									tag: "Top 3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "space-y-2.5 text-xs",
										children: SHORTLIST.map(([n, fit, gap], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-medium",
												children: [
													"#",
													i + 1,
													" ",
													n
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-muted-foreground",
												children: gap
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-1.5 h-1.5 rounded-full bg-secondary",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
												className: "h-full rounded-full bg-gradient-primary",
												initial: { width: 0 },
												whileInView: { width: `${fit}%` },
												viewport: { once: true },
												transition: {
													duration: .9,
													delay: .2 + i * .1
												}
											})
										})] }, n))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
									title: "Negotiation · Supplier A",
									tag: "Round 2 of 5",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
										className: "relative space-y-2.5 border-l border-primary/25 pl-4 text-xs",
										children: TIMELINE.map(([r, t], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "relative",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `absolute -left-[21px] top-1 size-2 rounded-full ${i === TIMELINE.length - 1 ? "bg-primary shadow-glow" : "bg-primary/40"}` }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mr-2 font-semibold text-primary",
													children: r
												}),
												t
											]
										}, t))
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
									title: "Sourcing decision",
									tag: "Awaiting you",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
										className: "grid grid-cols-3 gap-2 text-xs",
										children: [
											["Unit price", "Agreed"],
											["Delivery", "30 days"],
											["Checks", "All passed"]
										].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-xl bg-secondary/70 p-2.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "text-muted-foreground",
												children: k
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
												className: "mt-0.5 font-semibold",
												children: v
											})]
										}, k))
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-3 flex gap-2",
										"aria-hidden": true,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full bg-gradient-primary px-3.5 py-1.5 text-[11px] font-semibold text-primary-foreground",
											children: "Accept offer"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full border px-3.5 py-1.5 text-[11px] font-semibold",
											children: "Decline"
										})]
									})]
								})
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 grid gap-5 md:grid-cols-3",
					children: POINTS.map(([Icon, t, d], i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						...revealDelay(i + 2),
						className: "rounded-2xl p-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-10 place-items-center rounded-xl bg-accent text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
									className: "size-5",
									"aria-hidden": true
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "mt-4 font-semibold",
								children: t
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1.5 text-sm text-muted-foreground",
								children: d
							})
						]
					}, t))
				})
			]
		})]
	});
}
function Panel({ title, tag, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border/70 bg-card/85 p-4 shadow-[var(--shadow-soft)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-3 flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-semibold",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-muted-foreground",
				children: tag
			})]
		}), children]
	});
}
var STAGES = [
	{
		icon: import_lucide_react.FileUp,
		title: "Upload requirements",
		body: "Drop a CSV or XLSX. Column variations are mapped and every row is validated on its own.",
		detail: "Each file becomes its own request"
	},
	{
		icon: import_lucide_react.Search,
		title: "Discover suppliers & alternatives",
		body: "Each item is matched against qualified offerings; the top three are shortlisted with their real gaps.",
		detail: "Substitutes flagged for qualification"
	},
	{
		icon: import_lucide_react.Scale,
		title: "Evaluate offers",
		body: "Prices, totals, lead times, MOQ and compliance are checked independently — not taken on trust.",
		detail: "Arithmetic and terms verified"
	},
	{
		icon: import_lucide_react.Handshake,
		title: "Negotiate autonomously",
		body: "The agent negotiates by email within your ceiling, with diminishing concessions and clear round limits.",
		detail: "Unclear replies go to you"
	},
	{
		icon: import_lucide_react.CheckCircle2,
		title: "Decide — you stay in control",
		body: "Agreed offers wait for your approval. Only then is the supplier notified of the outcome.",
		detail: "No automatic purchase orders"
	}
];
/** Five-stage visual journey from requirement file to buyer-approved sourcing decision. */
function HowItWorks() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "how",
		"aria-labelledby": "how-title",
		className: "relative bg-secondary/50 px-5 py-24 md:py-32",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-6xl",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				...reveal,
				className: "max-w-2xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: eyebrow,
						children: "How it works"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "how-title",
						className: "mt-3 text-4xl font-bold md:text-5xl",
						children: "Five stages. One accountable decision."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-lg text-muted-foreground",
						children: "BEDRO automates the work between a requirement file and a sourcing decision — and leaves the decision with you."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
				className: "relative mt-16 grid gap-6 lg:grid-cols-5 lg:gap-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
						"aria-hidden": true,
						initial: { scaleX: 0 },
						whileInView: { scaleX: 1 },
						viewport: {
							once: true,
							amount: .4
						},
						transition: {
							duration: 1.2,
							ease: EASE
						},
						className: "absolute left-[10%] right-[10%] top-7 hidden h-px origin-left bg-gradient-to-r from-primary/10 via-primary/50 to-primary/10 lg:block"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "absolute bottom-6 left-7 top-6 w-px bg-gradient-to-b from-primary/10 via-primary/40 to-primary/10 lg:hidden"
					}),
					STAGES.map(({ icon: Icon, title, body, detail }, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.li, {
						...revealDelay(i, .1),
						className: "relative flex gap-5 lg:block",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "relative z-10 grid size-14 shrink-0 place-items-center rounded-2xl bg-card text-primary shadow-elegant ring-1 ring-primary/15 lg:mx-auto",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
								className: "size-6",
								"aria-hidden": true
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-gradient-primary text-[10px] font-bold text-primary-foreground",
								children: i + 1
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "glass-capsule rounded-2xl p-5 lg:mt-6 lg:min-h-[220px]",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-semibold",
									children: title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-muted-foreground",
									children: body
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-xs font-semibold text-primary",
									children: detail
								})
							]
						})]
					}, title))
				]
			})]
		})
	});
}
var FAQ = [
	["What does BEDRO automate, and what stays with my team?", "BEDRO automates the work between a requirement file and a sourcing decision: validating every line item, pooling genuinely compatible demand, qualifying and shortlisting suppliers, and negotiating with the selected supplier by email. Your team keeps the decisions that carry commercial commitment — choosing to proceed with an agreed offer, and anything the agent flags for review."],
	["How are suppliers sourced and qualified?", "Each validated requirement is checked against your supplier catalogue on hard criteria — specification and grade, minimum order quantity, available stock, lead time against your deadline, quality rating, certifications and compliance status. Only offerings that pass every check are ranked, and at most three companies are shortlisted. Possible substitutes are shown separately and always marked as needing engineering qualification."],
	["How does the negotiation agent decide what to offer?", "It works from a policy you configure: a target derived from the list price and your budget, and a ceiling it can never exceed. Concessions shrink round by round, the agent holds its position when a supplier does not move, and every negotiation has a round limit. When agreement is not realistic, it stops and recommends the other eligible suppliers instead of conceding further."],
	["What happens when a supplier reply is unclear or conditional?", "Replies are read without a fixed template — unit price, quantity, totals, shipping, payment terms, warranty and conditions are extracted and the arithmetic is checked. If essential details are missing or contradictory, the agent asks one concise clarification question. Conditional offers, changed terms, advance-payment requests or low-confidence readings go to your review; they are never accepted automatically."],
	["Can BEDRO commit us to a purchase?", "No. An agreed offer is verified independently and then waits for your explicit approval. Only after you approve does the supplier receive an acceptance confirmation, which states that a formal purchase order follows separately. BEDRO does not create purchase orders."],
	["How is our commercial information protected?", "Budgets, price ceilings and negotiation strategy are never included in supplier emails, and one supplier never learns another supplier's identity or price. Requests and negotiations are scoped to your workspace, supplier emails are treated as untrusted data, and a test mode restricts sending to approved addresses until you enable live supplier communication."],
	["Which risks does BEDRO surface before a decision?", "Concrete gaps rather than opaque scores: MOQ above your quantity, insufficient stock, lead times that miss your deadline, missing certifications or compliance issues, unpriced shipping that leaves the landed cost incomplete, and payment terms that need approval. Each one is shown next to the offer it affects."],
	["How does BEDRO fit into our existing systems?", "Requirements arrive as CSV or XLSX files, so no system change is needed to start. Supplier conversations run through your connected mailbox and stay in their original email threads. Every decision, offer and message is recorded with its history, so your team can raise the purchase order in your existing procurement system."]
];
/** Buyer FAQ — accessible accordion (button + region, one panel open at a time). */
function Faq() {
	const [open, setOpen] = (0, import_react.useState)(0);
	const base = (0, import_react.useId)();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "faq",
		"aria-labelledby": "faq-title",
		className: "px-5 py-24 md:py-32",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				...reveal,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: eyebrow,
						children: "FAQ"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						id: "faq-title",
						className: "mt-3 text-4xl font-bold md:text-5xl",
						children: "Questions procurement teams ask."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-lg text-muted-foreground",
						children: "How BEDRO sources, negotiates and protects your commercial position — and where you stay in control."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				...reveal,
				className: "glass-capsule divide-y divide-border/60 rounded-3xl px-2",
				children: FAQ.map(([q, a], i) => {
					const isOpen = open === i;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						id: `${base}-q${i}`,
						"aria-expanded": isOpen,
						"aria-controls": `${base}-a${i}`,
						onClick: () => setOpen(isOpen ? null : i),
						className: "flex w-full items-center justify-between gap-4 rounded-2xl px-4 py-5 text-left font-semibold outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring",
						children: [q, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: `grid size-7 shrink-0 place-items-center rounded-full border transition-[transform,background-color] duration-300 ${isOpen ? "rotate-45 border-primary/30 bg-accent text-primary" : "bg-card"}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Plus, {
								className: "size-3.5",
								"aria-hidden": true
							})
						})]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
						initial: false,
						children: isOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							id: `${base}-a${i}`,
							role: "region",
							"aria-labelledby": `${base}-q${i}`,
							initial: {
								height: 0,
								opacity: 0
							},
							animate: {
								height: "auto",
								opacity: 1
							},
							exit: {
								height: 0,
								opacity: 0
							},
							transition: {
								duration: .3,
								ease: EASE
							},
							className: "overflow-hidden",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-4 pb-6 text-muted-foreground",
								children: a
							})
						})
					})] }, q);
				})
			})]
		})
	});
}
/** Enterprise footer: brand, product summary, section links and workspace access. No invented contact/legal links. */
function SiteFooter({ sections, go }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "relative border-t border-border/70 bg-gradient-to-b from-background to-secondary/60 px-5 pb-10 pt-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.4fr_1fr_1fr]",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "grid size-8 grid-cols-2 gap-0.75 rounded-lg bg-gradient-primary p-1.25 shadow-elegant",
						children: [
							0,
							1,
							2,
							3
						].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `rounded-[2px] bg-primary-foreground ${i === 1 ? "opacity-60" : "opacity-95"}` }, i))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-display text-xl font-bold tracking-tight",
						children: ["BEDRO", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-primary",
							children: "."
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-sm text-sm text-muted-foreground",
					children: "Autonomous procurement for semiconductor manufacturers — from requirement files to buyer-approved sourcing decisions, with every negotiation on record."
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					"aria-label": "Footer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xs font-bold uppercase tracking-[0.16em] text-foreground",
						children: "Explore"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-2.5 text-sm",
						children: sections.map(([l, id]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => go(id),
							className: "rounded text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
							children: l
						}) }, id))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-xs font-bold uppercase tracking-[0.16em] text-foreground",
						children: "Workspace"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-muted-foreground",
						children: "Upload requirements, follow negotiations and approve sourcing decisions."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/workspace",
						className: "mt-4 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-primary outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring",
						children: ["Open Procurement Workspace ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowRight, { className: "size-3.5" })]
					})
				] })
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto mt-12 flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
				"© ",
				(/* @__PURE__ */ new Date()).getFullYear(),
				" BEDRO"
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Buyer approval required for every award." })]
		})]
	});
}
var NAV = [
	["INTELLIGENCE ENGINES", "engines"],
	["PROCUREMENT WORKSPACE", "workspace"],
	["HOW IT WORKS", "how"],
	["FAQ", "faq"]
];
var label = (l) => l === "FAQ" ? l : l.charAt(0) + l.slice(1).toLowerCase();
function Nav() {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [scrolled, setScrolled] = (0, import_react.useState)(false);
	const menuRef = (0, import_react.useRef)(null);
	const toggleRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		const desktop = window.matchMedia("(min-width: 1024px)");
		const onDesktop = () => desktop.matches && setOpen(false);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		desktop.addEventListener("change", onDesktop);
		return () => {
			window.removeEventListener("scroll", onScroll);
			desktop.removeEventListener("change", onDesktop);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		menuRef.current?.querySelector("a, button")?.focus();
		const onKey = (e) => {
			if (e.key !== "Escape") return;
			setOpen(false);
			toggleRef.current?.focus();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.header, {
		initial: {
			opacity: 0,
			y: -12
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .5,
			ease: EASE
		},
		className: "fixed inset-x-0 top-3 z-50 px-3 sm:top-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: `glass-nav mx-auto flex h-14 max-w-6xl items-center gap-3 rounded-2xl pl-4 pr-2 sm:h-16 sm:pl-5 ${scrolled ? "shadow-elegant" : ""}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "#top",
					"aria-label": "BEDRO — back to top",
					className: "flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						className: "grid size-7 grid-cols-2 gap-0.75 rounded-lg bg-gradient-primary p-1.25 shadow-elegant",
						children: [
							0,
							1,
							2,
							3
						].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `rounded-[2px] bg-primary-foreground ${i === 1 ? "opacity-60" : "opacity-95"}` }, i))
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrandWordmark, {})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					"aria-label": "Site",
					className: "mx-auto hidden items-center gap-0.5 lg:flex",
					children: NAV.map(([l, id]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => scrollToSection(id),
						className: "nav-link",
						children: label(l)
					}, id))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/workspace",
					className: "ml-auto hidden h-10 items-center gap-1.5 rounded-xl bg-gradient-primary px-4 text-[13px] font-semibold text-primary-foreground shadow-elegant outline-none transition-[box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-glow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:ml-0 lg:inline-flex",
					children: ["Open Workspace ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ArrowRight, { className: "size-3.5" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					ref: toggleRef,
					type: "button",
					className: "ml-auto grid size-10 place-items-center rounded-xl text-foreground outline-none transition-colors hover:bg-card/70 focus-visible:ring-2 focus-visible:ring-ring lg:hidden",
					"aria-label": open ? "Close menu" : "Open menu",
					"aria-expanded": open,
					"aria-controls": "landing-menu",
					onClick: () => setOpen(!open),
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.X, { className: "size-5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Menu, { className: "size-5" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			id: "landing-menu",
			ref: menuRef,
			initial: {
				opacity: 0,
				y: -6,
				scale: .98
			},
			animate: {
				opacity: 1,
				y: 0,
				scale: 1
			},
			exit: {
				opacity: 0,
				y: -6,
				scale: .98
			},
			transition: {
				duration: .22,
				ease: EASE
			},
			className: "glass-nav mx-auto mt-2 max-w-6xl origin-top rounded-2xl p-2 lg:hidden",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				"aria-label": "Site",
				className: "flex flex-col",
				children: [NAV.map(([l, id]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => {
						setOpen(false);
						scrollToSection(id);
					},
					className: `rounded-xl px-4 py-3 text-left text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring hover:bg-card/70`,
					children: label(l)
				}, id)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/workspace",
					onClick: () => setOpen(false),
					className: "mt-1 rounded-xl bg-gradient-primary px-4 py-3 text-left text-sm font-semibold text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
					children: "Open Procurement Workspace"
				})]
			})
		}) })]
	});
}
function Landing() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MotionConfig, {
		reducedMotion: "user",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			id: "top",
			className: "bg-background",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, { go: scrollToSection }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WorkspaceShowcase, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HowItWorks, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Faq, {})
				] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {
					sections: NAV.map(([l, id]) => [label(l), id]),
					go: scrollToSection
				})
			]
		})
	});
}
//#endregion
export { Landing as component };
