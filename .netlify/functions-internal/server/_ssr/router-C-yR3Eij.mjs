import { d as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { S as useRouter, _ as lazyRouteComponent, b as Link, d as Scripts, f as HeadContent, g as Outlet, h as createRouter, v as createFileRoute, y as createRootRouteWithContext } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-C-yR3Eij.js
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-CfjVqaHC.css";
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$8 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "BEDRO — Autonomous Procurement" },
			{
				name: "description",
				content: "AI-assisted autonomous procurement for semiconductor manufacturers."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "theme-color",
				content: "#f7f9fc"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Sora:wght@500;600;700;800&display=swap"
			},
			{
				rel: "icon",
				href: "/favicon.svg",
				type: "image/svg+xml"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				sizes: "16x16 32x32 48x48"
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png"
			},
			{
				rel: "manifest",
				href: "/site.webmanifest"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$8.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
	});
}
var $$splitComponentImporter$7 = () => import("./routes-CZDOFA6S.mjs");
var Route$7 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "BEDRO — Autonomous Procurement for Semiconductors" },
		{
			name: "description",
			content: "Pool purchasing power, discover qualified alternatives, and negotiate on your terms."
		},
		{
			property: "og:title",
			content: "BEDRO — Autonomous Procurement for Semiconductors"
		},
		{
			property: "og:description",
			content: "Pool purchasing power, discover qualified alternatives, and negotiate on your terms."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
var $$splitComponentImporter$6 = () => import("./workspace-Cyszv3hx.mjs");
var Route$6 = createFileRoute("/workspace")({
	head: () => ({ meta: [
		{ title: "Procurement Workspace — BEDRO" },
		{
			name: "description",
			content: "Upload requirements, compare shortlisted suppliers, negotiate and decide."
		},
		{
			property: "og:title",
			content: "Procurement Workspace — BEDRO"
		},
		{
			property: "og:description",
			content: "Upload requirements, compare shortlisted suppliers, negotiate and decide."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
/** The backend advances negotiations by itself (inbox polling, agent replies, outcome emails). When any
*  conversation shows new activity, refresh every view derived from negotiations so pages stay consistent. */
var $$splitComponentImporter$5 = () => import("./workspace.index-UZWGzukZ.mjs");
var Route$5 = createFileRoute("/workspace/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./workspace.decision-D4fNLGJj.mjs");
var Route$4 = createFileRoute("/workspace/decision")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./workspace.negotiations-DWg44fPU.mjs");
var Route$3 = createFileRoute("/workspace/negotiations")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
/** Email facts are distinct: prepared ≠ accepted by provider ≠ delivered ≠ replied. */
/** The agent's latest persisted decision: outcome and its business reason (no internal reasoning). */
/** What the supplier's latest reply was understood to say. Tone is shown but never drives a commercial decision. */
var $$splitComponentImporter$2 = () => import("./workspace.pooling-DWGrPpxp.mjs");
var Route$2 = createFileRoute("/workspace/pooling")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
/** Quantities are only ever added within one unit of measure (the backend never converts units). */
var $$splitComponentImporter$1 = () => import("./workspace.requirements-B6LBS68P.mjs");
var Route$1 = createFileRoute("/workspace/requirements")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
/** B. Submitted-batch removal: explicit backend cancel, confirmed first; the list refreshes only after success. */
var $$splitComponentImporter = () => import("./workspace.sourcing-DEfObhpp.mjs");
var Route = createFileRoute("/workspace/sourcing")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$7.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$8
});
var WorkspaceRoute = Route$6.update({
	id: "/workspace",
	path: "/workspace",
	getParentRoute: () => Route$8
});
var WorkspaceIndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => WorkspaceRoute
});
var WorkspaceRouteChildren = {
	WorkspaceDecisionRoute: Route$4.update({
		id: "/decision",
		path: "/decision",
		getParentRoute: () => WorkspaceRoute
	}),
	WorkspaceNegotiationsRoute: Route$3.update({
		id: "/negotiations",
		path: "/negotiations",
		getParentRoute: () => WorkspaceRoute
	}),
	WorkspacePoolingRoute: Route$2.update({
		id: "/pooling",
		path: "/pooling",
		getParentRoute: () => WorkspaceRoute
	}),
	WorkspaceRequirementsRoute: Route$1.update({
		id: "/requirements",
		path: "/requirements",
		getParentRoute: () => WorkspaceRoute
	}),
	WorkspaceSourcingRoute: Route.update({
		id: "/sourcing",
		path: "/sourcing",
		getParentRoute: () => WorkspaceRoute
	}),
	WorkspaceIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	WorkspaceRoute: WorkspaceRoute._addFileChildren(WorkspaceRouteChildren)
};
var routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
