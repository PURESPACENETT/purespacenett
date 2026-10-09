import { getAnalyticsConsent } from "@/components/cookie-consent";
import { getMarketingAttribution } from "@/lib/attribution";

const measurementId = import.meta.env["VITE_GOOGLE_ANALYTICS_ID"] as string | undefined;
const googleAdsId = import.meta.env["VITE_GOOGLE_ADS_ID"] as string | undefined;
const quoteConversionLabel = import.meta.env["VITE_GOOGLE_ADS_QUOTE_CONVERSION_LABEL"] as string | undefined;
const b2bConversionLabel = import.meta.env["VITE_GOOGLE_ADS_B2B_CONVERSION_LABEL"] as string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function push(...args: unknown[]) {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  // Expose Google's standard global entry point so Tag Assistant and gtag.js
  // consume the same queued commands, including when the library loads later.
  window.gtag = window.gtag ?? ((...command: unknown[]) => window.dataLayer?.push(command));
  window.gtag(...args);
}

let initialized = false;

export function initAnalytics() {
  if (typeof window === "undefined" || (!measurementId && !googleAdsId)) return;

  if (!initialized) {
    initialized = true;
    // Load the Google tag so Tag Assistant can detect it, while withholding
    // analytics and advertising storage until the visitor makes a choice.
    push("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });

    const tagId = measurementId ?? googleAdsId!;
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${tagId}`;
    document.head.appendChild(script);
    push("js", new Date());
    push("config", tagId, { send_page_view: false });
    if (measurementId && googleAdsId && googleAdsId !== measurementId) push("config", googleAdsId, { send_page_view: false });
  }

  // The site's existing opt-in covers audience analytics. Advertising
  // storage and personalization remain denied because the consent UI does
  // not request those permissions.
  push("consent", "update", {
    analytics_storage: getAnalyticsConsent() ? "granted" : "denied",
  });
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

export function trackLeadGenerated(type: "quote" | "b2b", params?: Record<string, unknown>) {
  trackEvent("generate_lead", params);
  const conversionLabel = type === "quote" ? quoteConversionLabel : b2bConversionLabel;
  if (typeof window === "undefined" || !getAnalyticsConsent() || !googleAdsId || !conversionLabel) return;
  if (!initialized) initAnalytics();
  push("event", "conversion", {
    send_to: `${googleAdsId}/${conversionLabel}`,
    ...getMarketingAttribution(),
    ...params,
  });
}

export function trackContactClick(type: "phone" | "whatsapp" | "email", source: string) {
  trackEvent(type === "phone" ? "contact_phone" : type === "whatsapp" ? "contact_whatsapp" : "contact_email", { source });
}

export const analyticsEnabled = Boolean(measurementId || googleAdsId);
export const googleAdsEnabled = Boolean(googleAdsId && (quoteConversionLabel || b2bConversionLabel));

