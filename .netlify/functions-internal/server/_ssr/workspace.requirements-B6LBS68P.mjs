import { r as __toESM } from "../_runtime.mjs";
import { a as AlertDialogDescription$1, c as AlertDialogTitle$1, d as require_jsx_runtime, f as require_react, i as AlertDialogContent$1, n as AlertDialogAction$1, o as AlertDialogOverlay$1, r as AlertDialogCancel$1, s as AlertDialogPortal$1, t as AlertDialog$1 } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useQueryClient, n as useQuery } from "../_libs/tanstack__react-query.mjs";
import { t as cn } from "./utils-C_uf36nf.mjs";
import { t as require_lucide_react } from "../_libs/lucide-react.mjs";
import { a as LoadingNotice, d as buttonVariants, f as describeApiError, i as ErrorNotice, n as Button, o as PageHeader, r as Empty, s as Pill } from "./query-notice-CfqlvxHB.mjs";
import { t as actions } from "./store-TKTi_tzl.mjs";
import { a as requirementsQuery, i as precheckFile, n as cancelBatch, o as uploadRequirementFile, r as fetchBatchDetail, s as useRequirements, t as ACCEPTED } from "./requirements-BS3nigpf.mjs";
import { n as invalidatePooling } from "./pooling-CdXIbSpH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/workspace.requirements-B6LBS68P.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_lucide_react = require_lucide_react();
var AlertDialog = AlertDialog$1;
var AlertDialogPortal = AlertDialogPortal$1;
var AlertDialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay$1, {
	className: cn("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
AlertDialogOverlay.displayName = AlertDialogOverlay$1.displayName;
var AlertDialogContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogContent$1, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props
})] }));
AlertDialogContent.displayName = AlertDialogContent$1.displayName;
var AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
AlertDialogHeader.displayName = "AlertDialogHeader";
var AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
AlertDialogFooter.displayName = "AlertDialogFooter";
var AlertDialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle$1, {
	ref,
	className: cn("text-lg font-semibold", className),
	...props
}));
AlertDialogTitle.displayName = AlertDialogTitle$1.displayName;
var AlertDialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogDescription$1, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
AlertDialogDescription.displayName = AlertDialogDescription$1.displayName;
var AlertDialogAction = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction$1, {
	ref,
	className: cn(buttonVariants(), className),
	...props
}));
AlertDialogAction.displayName = AlertDialogAction$1.displayName;
var AlertDialogCancel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel$1, {
	ref,
	className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
	...props
}));
AlertDialogCancel.displayName = AlertDialogCancel$1.displayName;
var STATUS = {
	ready: {
		label: "Ready",
		tone: "success"
	},
	needs_review: {
		label: "Needs review",
		tone: "warning"
	},
	failed: {
		label: "No valid rows",
		tone: "danger"
	},
	cancelled: {
		label: "Cancelled",
		tone: "neutral"
	}
};
var kb = (n) => n < 1048576 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`;
function Requirements() {
	const qc = useQueryClient();
	const req = useRequirements();
	const input = (0, import_react.useRef)(null);
	const [drag, setDrag] = (0, import_react.useState)(false);
	const [drafts, setDrafts] = (0, import_react.useState)([]);
	const [results, setResults] = (0, import_react.useState)([]);
	const [toCancel, setToCancel] = (0, import_react.useState)(null);
	function addFiles(files) {
		if (!files?.length) return;
		const added = Array.from(files).map((file) => ({
			key: crypto.randomUUID(),
			file,
			error: precheckFile(file),
			uploading: false
		}));
		setDrafts((d) => [...d, ...added]);
		if (input.current) input.current.value = "";
	}
	/** A. Local removal: drops the unsubmitted file from browser state only. No backend call. */
	const removeDraft = (key) => setDrafts((d) => d.filter((x) => x.key !== key));
	const patchDraft = (key, p) => setDrafts((d) => d.map((x) => x.key === key ? {
		...x,
		...p
	} : x));
	async function upload(draft) {
		patchDraft(draft.key, {
			uploading: true,
			error: null
		});
		try {
			const res = await uploadRequirementFile(draft.file);
			removeDraft(draft.key);
			setResults((r) => [res, ...r]);
			actions.note(`Uploaded ${res.batch.fileName} — ${res.batch.importedRows} of ${res.batch.totalRows} rows imported`);
			await Promise.all([qc.invalidateQueries({ queryKey: requirementsQuery.queryKey }), invalidatePooling(qc)]);
		} catch (e) {
			patchDraft(draft.key, {
				uploading: false,
				error: describeApiError(e)
			});
		}
	}
	const uploadAll = () => drafts.filter((d) => !d.uploading && !precheckFile(d.file)).forEach(upload);
	const sessionIds = new Set(results.map((r) => r.batch.id));
	const batches = req.data?.batches ?? [];
	const fresh = batches.filter((b) => sessionIds.has(b.id));
	const earlier = batches.filter((b) => !sessionIds.has(b.id));
	const busy = drafts.some((d) => d.uploading);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			title: "Requirements",
			description: "Upload buyer requirement files. Files are validated and stored by the backend; each upload becomes its own batch and each valid row its own requirement item."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onDragOver: (e) => {
				e.preventDefault();
				setDrag(true);
			},
			onDragLeave: () => setDrag(false),
			onDrop: (e) => {
				e.preventDefault();
				setDrag(false);
				addFiles(e.dataTransfer.files);
			},
			className: `surface flex flex-col items-center border-2 border-dashed px-6 py-10 text-center transition ${drag ? "border-primary bg-accent" : ""}`,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.UploadCloud, { className: "size-8 text-primary" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 font-semibold",
					children: "Drag and drop requirement files"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "CSV or XLSX · up to 5 MB · required columns: material_name, component_category, required_quantity, unit_of_measure"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-5",
					onClick: () => input.current?.click(),
					children: "Select Files"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: input,
					type: "file",
					accept: ACCEPTED,
					multiple: true,
					hidden: true,
					"data-testid": "file-input",
					onChange: (e) => addFiles(e.target.files)
				})
			]
		}),
		drafts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "surface mt-4 p-4",
			"aria-label": "Selected files",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-semibold",
					children: "Selected files — not uploaded yet"
				}), drafts.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					disabled: busy || drafts.every((d) => !!precheckFile(d.file)),
					onClick: uploadAll,
					children: "Upload all"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 divide-y",
				children: drafts.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-center gap-3 py-2.5 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileSpreadsheet, { className: "size-4 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mr-auto min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium",
									children: d.file.name
								}),
								" ",
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-muted-foreground",
									children: ["· ", kb(d.file.size)]
								}),
								d.error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									role: "alert",
									className: "mt-1 block text-xs text-destructive",
									children: d.error
								})
							]
						}),
						d.uploading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
							tone: "primary",
							children: "Uploading…"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "outline",
							disabled: !!precheckFile(d.file),
							onClick: () => upload(d),
							children: "Upload"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							"aria-label": `Remove ${d.file.name} from selection`,
							onClick: () => removeDraft(d.key),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.X, { className: "size-4" }), "Remove"]
						})] })
					]
				}, d.key))
			})]
		}),
		results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 space-y-2",
			children: results.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UploadOutcome, { result: r }, r.batch.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 space-y-6",
			children: [
				req.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading requirement batches…" }),
				req.isError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
					title: "Requirement batches unavailable.",
					error: req.error,
					onRetry: () => req.refetch()
				}),
				req.isSuccess && batches.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Empty, {
					icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.FileUp, { className: "size-5" }),
					title: "No requirement batches",
					body: "Uploaded batches appear here with validation results for each line item."
				}),
				fresh.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BatchGroup, {
					title: "Uploaded this session",
					batches: fresh,
					items: req.data.items,
					onCancel: setToCancel
				}),
				earlier.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BatchGroup, {
					title: fresh.length ? "Earlier batches" : "Batches",
					batches: earlier,
					items: req.data.items,
					onCancel: setToCancel
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CancelDialog, {
			batch: toCancel,
			onClose: () => setToCancel(null)
		})
	] });
}
function UploadOutcome({ result: { batch: b, possibleDuplicateOf } }) {
	const ok = b.status === "ready";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		role: "status",
		className: `flex items-start gap-2 rounded-xl p-3 text-sm ${ok ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`,
		children: [ok ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.CheckCircle2, { className: "mt-0.5 size-4 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.AlertTriangle, { className: "mt-0.5 size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-semibold",
				children: b.fileName
			}),
			" saved as batch ",
			b.id.slice(0, 8),
			" — ",
			b.importedRows,
			" of ",
			b.totalRows,
			" rows imported",
			b.rejectedRows > 0 && `, ${b.rejectedRows} rejected (see the batch below)`,
			".",
			possibleDuplicateOf.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "block text-xs",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Copy, { className: "mr-1 inline size-3" }),
					"Identical content to ",
					possibleDuplicateOf.length,
					" earlier batch(es). It was kept as a separate batch; remove it if it was uploaded by mistake."
				]
			})
		] })]
	});
}
function BatchGroup({ title, batches, items, onCancel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
		className: "mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
		children: title
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-6",
		children: batches.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BatchCard, {
			batch: b,
			items: b.itemIds.map((id) => items[id]).filter((x) => !!x),
			onCancel
		}, b.id))
	})] });
}
function BatchCard({ batch: b, items, onCancel }) {
	const [showRejected, setShowRejected] = (0, import_react.useState)(false);
	const s = STATUS[b.status];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "surface overflow-hidden",
		"aria-label": `Batch ${b.fileName}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-3 border-b p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mr-auto min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-semibold",
							children: b.fileName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs text-muted-foreground",
							children: [
								"Batch ",
								b.id,
								" · ",
								new Date(b.uploadedAt).toLocaleString(),
								b.unmappedColumns.length > 0 && ` · Unmapped columns kept as extra attributes: ${b.unmappedColumns.join(", ")}`
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
						tone: s.tone,
						children: s.label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
						tone: "success",
						children: [b.importedRows, " imported"]
					}),
					b.rejectedRows > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Pill, {
						tone: "warning",
						children: [b.rejectedRows, " rejected"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						onClick: () => onCancel(b),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.Trash2, { className: "size-4" }), "Remove batch"]
					})
				]
			}),
			items.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
							"Row",
							"Ref",
							"Part",
							"Category",
							"Qty",
							"Max budget / unit",
							"Delivery",
							"Status"
						].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-2.5 font-semibold",
							children: h
						}, h)) })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y",
						children: items.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5 text-muted-foreground",
								children: r.rowNumber
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5 text-muted-foreground",
								children: r.sourceRequirementId ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5 font-medium",
								children: r.part
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5",
								children: r.category
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
								className: "px-4 py-2.5",
								children: [
									r.quantity?.toLocaleString() ?? "—",
									" ",
									r.unit
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5",
								children: r.targetPrice !== null ? `${r.targetPrice} ${r.currency ?? ""}` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5",
								children: r.requiredLeadDays !== null ? `${r.requiredLeadDays} d` : "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-2.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pill, {
									tone: "success",
									children: "Valid"
								})
							})
						] }, r.id))
					})]
				})
			}),
			b.rejectedRows > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					className: "flex items-center gap-1.5 text-sm font-medium text-warning",
					"aria-expanded": showRejected,
					onClick: () => setShowRejected((v) => !v),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_lucide_react.ChevronDown, { className: `size-4 transition ${showRejected ? "rotate-180" : ""}` }),
						showRejected ? "Hide" : "Show",
						" ",
						b.rejectedRows,
						" rejected row",
						b.rejectedRows > 1 ? "s" : ""
					]
				}), showRejected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RejectedRows, { batchId: b.id })]
			})
		]
	});
}
function RejectedRows({ batchId }) {
	const q = useQuery({
		queryKey: ["requirement-batch", batchId],
		queryFn: ({ signal }) => fetchBatchDetail(batchId, signal)
	});
	if (q.isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingNotice, { children: "Loading validation results…" })
	});
	if (q.isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-3",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorNotice, {
			title: "Validation results unavailable.",
			error: q.error,
			onRetry: () => q.refetch()
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
		className: "mt-3 space-y-2 text-sm",
		children: q.data.rowErrors.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
			className: "rounded-lg bg-warning/10 px-3 py-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-semibold",
					children: [
						"Row ",
						e.rowNumber,
						":"
					]
				}),
				" ",
				e.errors.map((x) => `${x.field} — ${x.message}`).join("; ")
			]
		}, e.rowNumber))
	});
}
/** B. Submitted-batch removal: explicit backend cancel, confirmed first; the list refreshes only after success. */
function CancelDialog({ batch, onClose }) {
	const qc = useQueryClient();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	async function confirm() {
		if (!batch) return;
		setBusy(true);
		setError(null);
		try {
			await cancelBatch(batch.id);
			actions.note(`Removed batch ${batch.fileName}`);
			await Promise.all([qc.invalidateQueries({ queryKey: requirementsQuery.queryKey }), invalidatePooling(qc)]);
			onClose();
		} catch (e) {
			setError(describeApiError(e));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
		open: !!batch,
		onOpenChange: (o) => {
			if (!o && !busy) {
				setError(null);
				onClose();
			}
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogTitle, { children: [
				"Remove batch “",
				batch?.fileName,
				"”?"
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [
				"Its ",
				batch?.importedRows ?? 0,
				" requirement item(s) will be withdrawn from sourcing. The batch is cancelled rather than deleted, so its records are kept for traceability. Other batches are not affected."
			] })] }),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				role: "alert",
				className: "text-sm text-destructive",
				children: ["Could not remove the batch: ", error]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, {
				disabled: busy,
				children: "Keep batch"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "destructive",
				disabled: busy,
				onClick: confirm,
				children: busy ? "Removing…" : "Remove batch"
			})] })
		] })
	});
}
//#endregion
export { Requirements as component };
