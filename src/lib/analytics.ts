import { getAnalyticsConsent } from "@/components/cookie-consent";
import { getMarketingAttribution } from "@/lib/attribution";

const measurementId = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY"] as string | undefined;
const googleAdsId = import.meta.env["VITE_GOOGLE_ADS_ID"] as string | undefined;
const googleAdsConversionLabel = import.meta.env["VITE_GOOGLE_ADS_CONVERSION_LABEL"] as string | undefined;

declare global { interface Window { dataLayer?: unknown[]; } }

function push(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push(args);
}

let initialized = false;

export function initAnalytics() {
  if (initialized || typeof window === "undefined" || !getAnalyticsConsent() || (!measurementId && !googleAdsId)) return;
  initialized = true;
  const tagId = measurementId ?? googleAdsId!;
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
  document.head.appendChild(script);
  push("js", new Date());
  push("config", tagId, { send_page_view: false });
  if (measurementId && googleAdsId && googleAdsId !== measurementId) push("config", googleAdsId, { send_page_view: false });
}

export function trackPageView(path: string, title?: string) {
  if ((!measurementId && !googleAdsId) || !getAnalyticsConsent()) return;
  if (!initialized) initAnalytics();
  push("event", "page_view", {
    page_path: path,
    page_location: typeof window !== "undefined" ? window.location.href : path,
    ...(title ? { page_title: title } : {}),
  });
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if ((!measurementId && !googleAdsId) || !getAnalyticsConsent()) return;
  if (!initialized) initAnalytics();
  push("event", name, { ...getMarketingAttribution(), ...(params ?? {}) });
}

export function trackLeadGenerated(params?: Record<string, unknown>) {
  trackEvent("generate_lead", params);
  if (typeof window === "undefined" || !getAnalyticsConsent() || !googleAdsId || !googleAdsConversionLabel) return;
  if (!initialized) initAnalytics();
  push("event", "conversion", {
    send_to: `${googleAdsId}/${googleAdsConversionLabel}`,
    ...getMarketingAttribution(),
    ...params,
  });
}

export function trackContactClick(type: "phone" | "whatsapp" | "email", source: string) {
  trackEvent(type === "phone" ? "contact_phone" : type === "whatsapp" ? "contact_whatsapp" : "contact_email", { source });
}

export const analyticsEnabled = Boolean(measurementId || googleAdsId);
export const googleAdsEnabled = Boolean(googleAdsId && googleAdsConversionLabel);
