/**
 * Suivi Google Analytics (GA4).
 * Ne fait rien si l'identifiant de mesure n'est pas configuré.
 */

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

/** Charge gtag.js une seule fois, côté navigateur. */
export function initAnalytics() {
  if (initialized || typeof window === "undefined" || !measurementId) return;
  initialized = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  push("js", new Date());
  push("config", measurementId, { send_page_view: false });
}

/** Envoie une vue de page (navigation interne incluse). */
export function trackPageView(path: string, title?: string) {
  if (!measurementId) return;
  push("event", "page_view", {
    page_path: path,
    page_location: typeof window !== "undefined" ? window.location.href : path,
    ...(title ? { page_title: title } : {}),
  });
}

/** Envoie un évènement personnalisé (clic devis, envoi du formulaire…). */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!measurementId) return;
  push("event", name, params ?? {});
}

export const analyticsEnabled = Boolean(measurementId);
