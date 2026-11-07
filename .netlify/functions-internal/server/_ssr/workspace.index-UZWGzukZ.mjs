import { d as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { b as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as useQuery, t as queryOptions } from "../_libs/tanstack__react-query.mjs";
import { t as require_lucide_react } from "../_libs/lucide-react.mjs";
import { a as LoadingNotice, i as ErrorNotice, l as Stat, n as Button, o as PageHeader, p as fetchAllPages, r as Empty, s as Pill, t as ApiError, u as apiRequest } from "./query-notice-CfqlvxHB.mjs";
import { D as toDate, E as syncStatusQuery, f as emailStatusQuery, j as useNegotiations, l as conversationsQuery, r as STATUS_LABEL, u as countByStage } from "./negotiations-BrGVm8_7.mjs";
import { o as sourcingBreakdown, s as useRequests } from "./procurement-CAPgAIqk.mjs";
import { s as useRequirements } from "./requirements-BS3nigpf.mjs";
import { a as usePools } from "./pooling-CdXIbSpH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workspace.index-UZWGzukZ.js
var import_jsx_runtime = require_jsx_runtime();
var import_lucide_react = require_lucide_react();
var catalogStatus = (q) => q.isPending ? "pending" : q.isError || !q.data ? "error" : q.data.offerings.length === 0 ? "empty" : "ready";
/** Loading / error / empty states for the API-backed supplier catalogue. Never renders placeholder suppliers. */
function CatalogNotice({ status, error, onRetry }) {
	if (status === "pending") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading supplier catalogue…" });
	if (status === "empty") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
		role: "status",
		className: "flex items-start gap-2 text-sm text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Database, { className: "mt-0.5 size-4 shrink-0" }), "The supplier database is empty. Run the supplier import on the backend to load the catalogue."]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
		title: "Supplier catalogue unavailable.",
		error,
		suffix: "No supplier data is shown.",
		...onRetry ? { onRetry } : {}
	});
}
var pct = (v, total) => total ? Math.round(v / total * 100) : 0;
/** Overview analytics: this workspace's procurement requirements by sourcing stage. Live from the backend
*  (GET /procurement-requests); nothing here is hardcoded. The React Bits Pro Analytics 5 donut
*  (@reactbits-pro/analytics-5) mounts in the chart slot with `segments` as its data and `total` as its center. */
function ProcurementAnalytics() {
	const requests = useRequests();
	const { total, segments } = sourcingBreakdown(requests.data ?? []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface p-5",
		"aria-labelledby": "analytics-title",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-baseline justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "analytics-title",
				className: "font-semibold",
				children: "Analytics"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: "Procurement requirements by sourcing stage"
			})]
		}), requests.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading procurement analytics…" })
		}) : requests.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
				title: "Analytics unavailable.",
				error: requests.error,
				onRetry: () => requests.refetch()
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid items-center gap-6 sm:grid-cols-[minmax(0,14rem)_1fr]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center sm:text-left",
				"data-chart-slot": "analytics-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-display text-4xl font-semibold tabular-nums",
						"aria-label": `${total} procurement requirements`,
						children: total.toLocaleString()
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
						children: "Total requirements"
					}),
					total === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-xs text-muted-foreground",
						children: "No active requirements yet — upload a requirement file to start sourcing."
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-2.5 text-sm",
				"aria-label": "Requirements by sourcing stage",
				children: segments.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3",
					title: `${s.label}: ${s.value} of ${total} (${pct(s.value, total)}%) — ${s.description}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							className: "size-2.5 shrink-0 rounded-full",
							style: { background: s.color }
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 truncate",
							children: s.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium tabular-nums",
							children: s.value.toLocaleString()
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "w-10 text-right text-xs tabular-nums text-muted-foreground",
							children: [pct(s.value, total), "%"]
						})
					]
				}, s.key))
			})]
		})]
	});
}
/** Supplier catalogue from the backend supplier database. Throws ApiError on failure — never falls back to fake data. */
async function fetchCatalog(signal) {
	const [supplierDtos, offerings] = await Promise.all([fetchAllPages("/suppliers", signal), fetchAllPages("/offerings", signal)]);
	return {
		suppliers: supplierDtos.map(({ manufacturing_capabilities, chip_model_reference: _, ...s }) => ({
			...s,
			capabilities: manufacturing_capabilities,
			offerings: offerings.filter((o) => o.supplier_id === s.supplier_id)
		})),
		offerings
	};
}
var catalogQuery = queryOptions({
	queryKey: ["supplier-catalog"],
	queryFn: ({ signal }) => fetchCatalog(signal),
	staleTime: 3e5,
	retry: 1
});
var useCatalog = () => useQuery(catalogQuery);
/** True when any record comes from the seeded sample CSV, so the UI can label it as sample data. */
var isSampleData = (c) => c.suppliers.some((s) => s.data_source === "sample_csv") || c.offerings.some((o) => o.data_source === "sample_csv");
/** Backend readiness. Throws ApiError(status 0) when the backend is unreachable — never reports a false "connected". */
async function getBackendReadiness(signal) {
	try {
		return await apiRequest("/health/ready", signal ? { signal } : {});
	} catch (e) {
		if (e instanceof ApiError && e.status === 503 && e.body) return e.body;
		throw e;
	}
}
function Overview() {
	const req = useRequirements();
	const batches = req.data?.batches ?? [];
	const items = Object.values(req.data?.items ?? {});
	const pools = usePools();
	const catalog = useCatalog();
	const cStatus = catalogStatus(catalog);
	const readiness = useQuery({
		queryKey: ["backend-readiness"],
		queryFn: ({ signal }) => getBackendReadiness(signal),
		retry: false,
		refetchInterval: 3e4
	});
	const rejected = batches.reduce((n, b) => n + b.rejectedRows, 0);
	const negs = useNegotiations();
	const negList = negs.data ?? [];
	const stages = negs.data ? countByStage(negList) : null;
	const recent = [...negList].sort((a, b) => toDate(b.updated_at).getTime() - toDate(a.updated_at).getTime()).slice(0, 6);
	const convs = useQuery({
		...conversationsQuery,
		refetchInterval: 3e4
	});
	const reviewCount = (convs.data?.conversations ?? []).reduce((n, c) => n + c.needs_review_count, 0) + (convs.data?.unmatched_count ?? 0);
	const integ = useQuery({
		queryKey: ["integrations-status"],
		queryFn: ({ signal }) => apiRequest("/integrations/status", { signal }),
		retry: false
	});
	const email = useQuery({
		...emailStatusQuery,
		refetchInterval: 6e4
	});
	const sync = useQuery({
		...syncStatusQuery,
		refetchInterval: 3e4
	});
	const e = email.data, ps = e?.provider_status, lastRun = sync.data?.last_run;
	const emailRow = email.isPending ? {
		status: "Checking…",
		tone: "neutral"
	} : !e ? {
		status: "Unknown",
		tone: "neutral"
	} : e.channel === "none" ? {
		status: "Not configured",
		tone: "danger"
	} : e.provider === "mock" ? {
		status: "Mock (simulated)",
		tone: "warning"
	} : ps?.state === "authorization_required" || ps?.configured === false ? {
		status: "Authorization required",
		tone: "danger"
	} : ps?.state === "connection_failed" ? {
		status: "Connection failed",
		tone: "danger"
	} : ps?.problem ? {
		status: "Wrong Gmail account",
		tone: "danger"
	} : ps?.state !== "connected" ? {
		status: "Not verified",
		tone: "warning"
	} : e.channel === "disabled" ? {
		status: "Connected · sending disabled",
		tone: "warning"
	} : {
		status: e.channel === "test" ? "Connected · Gmail test mode" : "Connected · Gmail live",
		tone: "success"
	};
	const repliesRow = integ.data?.simulation_mode === "demo" ? {
		status: "Simulated (demo)",
		tone: "warning"
	} : !e ? {
		status: "Unknown",
		tone: "neutral"
	} : e.channel !== "test" && e.channel !== "production" ? {
		status: "No email channel",
		tone: "danger"
	} : !sync.data ? {
		status: "Unknown",
		tone: "neutral"
	} : lastRun?.status === "error" ? {
		status: "Last check failed",
		tone: "danger"
	} : lastRun ? {
		status: `Checked ${toDate(lastRun.finished_at ?? lastRun.started_at).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit"
		})}`,
		tone: "success"
	} : {
		status: "Not checked yet",
		tone: "neutral"
	};
	const live = [
		{
			name: "Backend API",
			...readiness.isPending ? {
				status: "Checking…",
				tone: "neutral"
			} : readiness.data?.status === "ready" ? {
				status: "Connected",
				tone: "success"
			} : readiness.data ? {
				status: "Not Ready",
				tone: "warning"
			} : {
				status: "Unreachable",
				tone: "danger"
			}
		},
		{
			name: "Supplier database",
			...cStatus === "pending" ? {
				status: "Checking…",
				tone: "neutral"
			} : cStatus === "error" ? {
				status: "Unavailable",
				tone: "danger"
			} : {
				status: "Connected",
				tone: "success"
			}
		},
		{
			name: "Negotiation agent",
			...!integ.data ? {
				status: "Unknown",
				tone: "neutral"
			} : integ.data.llm.configured && integ.data.llm.enabled ? {
				status: "Rules + LLM key set",
				tone: "success"
			} : {
				status: "Rules only (no LLM key)",
				tone: "warning"
			}
		},
		{
			name: "Supplier email service",
			...emailRow
		},
		{
			name: "Supplier replies",
			...repliesRow
		}
	];
	const notes = [
		ps?.problem,
		ps?.state !== "connected" ? ps?.detail : null,
		lastRun?.status === "error" ? `Last inbox check failed: ${lastRun.error}` : null
	].filter(Boolean);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Overview",
			description: "Status of your requirement batches, negotiations and sourcing decisions."
		}),
		req.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading requirements…" }) : req.isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
			title: "Requirements unavailable.",
			error: req.error,
			onRetry: () => req.refetch()
		}) : batches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
			icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileUp, { className: "size-5" }),
			title: "No requirements uploaded",
			body: "Upload a CSV or XLSX requirement file to begin validation, supplier matching and shortlisting.",
			action: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/workspace/requirements",
					children: "Upload Requirements"
				})
			})
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid grid-cols-2 gap-4 md:grid-cols-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Requirement batches",
					value: batches.length,
					hint: `${items.length} line items · ${rejected} rejected rows`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Negotiating",
					value: negs.data ? stages.negotiating : "—",
					hint: negs.data ? `${negList.length} negotiations in total` : "Negotiations unavailable"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Awaiting your approval",
					value: negs.data ? stages.awaiting_approval : "—",
					hint: negs.data ? `${stages.needs_review} need manual review` : "Negotiations unavailable"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
					label: "Agreed (approved by you)",
					value: negs.data ? stages.concluded_success : "—",
					hint: negs.data ? `${stages.concluded_no_deal} closed without agreement` : "Negotiations unavailable"
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid grid-cols-2 gap-4 md:grid-cols-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Supplier replies to review",
				value: convs.data ? reviewCount : "—",
				hint: convs.data ? "Replies the agent did not act on" : "Conversations unavailable"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
				label: "Confirmed demand pools",
				value: pools.data ? pools.data.length : "—",
				hint: !pools.data ? "Demand pools unavailable" : pools.data.some((p) => p.approval_status === "pending") ? `${pools.data.filter((p) => p.approval_status === "pending").length} awaiting your approval` : "Compatible demand sourced together"
			})]
		})] }),
		negs.data && negList.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "surface mt-6 p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-semibold",
				children: "Recent negotiation outcomes"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 divide-y",
				children: recent.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0 truncate",
						children: [
							n.company_name,
							" · ",
							n.material_name
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: STATUS_LABEL[n.status].tone,
							children: STATUS_LABEL[n.status].label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground",
							children: toDate(n.updated_at).toLocaleString([], {
								dateStyle: "medium",
								timeStyle: "short"
							})
						})]
					})]
				}, n.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "lg:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProcurementAnalytics, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Integration status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-2 text-sm",
							children: live.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: i.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
									tone: i.tone,
									children: i.status
								})]
							}, i.name))
						}),
						notes.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							role: "alert",
							className: "mt-3 text-xs text-destructive",
							children: n
						}, n)),
						sync.data?.polling_interval_seconds === 0 && e && (e.channel === "test" || e.channel === "production") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-xs text-muted-foreground",
							children: "Replies are read when you click “Check inbox” in Supplier Communications (automatic checking is off)."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "surface p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-semibold",
							children: "Supplier catalogue"
						}), catalog.data && isSampleData(catalog.data) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, { children: "Sample data" })]
					}), cStatus !== "ready" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CatalogNotice, {
							status: cStatus,
							error: catalog.error,
							onRetry: () => catalog.refetch()
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: [
							catalog.data.suppliers.length,
							" suppliers · ",
							catalog.data.offerings.length,
							" offerings"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 space-y-1 text-sm",
						children: catalog.data.suppliers.map((x) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: x.company_name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: x.offerings.length
							})]
						}, x.supplier_id))
					})] })]
				})]
			})]
		})
	] });
}
//#endregion
export { Overview as component };
