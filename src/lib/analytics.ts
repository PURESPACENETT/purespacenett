import { getAnalyticsConsent } from "@/components/cookie-consent";

const measurementId = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY"] as
  | string
  | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function push(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
}

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === "undefined" || !measurementId || !getAnalyticsConsent()) return;
  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  push("js", new Date());
  push("config", measurementId, { send_page_view: false });
}

export function trackPageView(path: string, title?: string) {
  if (!measurementId || !getAnalyticsConsent()) return;
  if (!initialized) initAnalytics();
  push("event", "page_view", {
    page_path: path,
    page_location: typeof window !== "undefined" ? window.location.href : path,
    ...(title ? { page_title: title } : {}),
  });
}

function attributionParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const url = new URL(window.location.href);
  const params: Record<string, string> = {};
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = url.searchParams.get(key);
    if (value) params[key] = value;
  }
  if (document.referrer) params['referrer'] = document.referrer;
  params['landing_page'] = window.location.pathname;
  return params;
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!measurementId || !getAnalyticsConsent()) return;
  if (!initialized) initAnalytics();
  push("event", name, { ...attributionParams(), ...(params ?? {}) });
}

export const analyticsEnabled = Boolean(measurementId);
