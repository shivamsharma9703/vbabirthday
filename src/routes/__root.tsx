import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { MotionConfig } from "motion/react";
import { PreviewBar } from "@/components/experience/PreviewBar";
import { ExperienceProvider } from "@/lib/experience/state";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center grain bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="display text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center grain bg-background px-6">
      <div className="max-w-md text-center">
        <h1 className="display-sm text-foreground">This page didn't load</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input grain bg-background px-6 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

/** Tells people on a too-old iOS/browser to update, instead of showing a broken page. */
const OLD_BROWSER_CHECK = `(function(){try{var ok=window.CSS&&CSS.supports&&CSS.supports("color","color-mix(in oklab, red, blue)")&&CSS.supports("height","100dvh");if(!ok){document.addEventListener("DOMContentLoaded",function(){var d=document.createElement("div");d.style.cssText="position:fixed;inset:0;z-index:99999;background:#050505;color:#fff;display:flex;align-items:center;justify-content:center;padding:32px;text-align:center;font:22px/1.5 Georgia,serif";d.textContent="This story needs a newer iPhone software. Please update iOS (Settings → General → Software Update), then open this link again.";document.body.appendChild(d)})}}catch(e){}})();`;

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "I Wasn't Looking For You" },
      { name: "description", content: "A private story for Vaishali." },
      { name: "robots", content: "noindex, nofollow" },
      { name: "theme-color", content: "#050505" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/og.png" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [{ children: OLD_BROWSER_CHECK }],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400&family=Instrument+Serif:ital@0;1&family=Caveat:wght@500&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  useEffect(() => {
    document.documentElement.dataset["lowPower"] = String(navigator.hardwareConcurrency <= 4);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <ExperienceProvider>
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <PreviewBar />
          <Outlet />
        </ExperienceProvider>
      </QueryClientProvider>
    </MotionConfig>
  );
}
