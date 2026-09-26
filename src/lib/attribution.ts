const STORAGE_KEY = "psn-marketing-attribution";
const KEYS = ["gclid", "gbraid", "wbraid", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

export type MarketingAttribution = Partial<Record<(typeof KEYS)[number], string>> & {
  landing_page?: string;
  referrer?: string;
};

function readStored(): MarketingAttribution {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) || "{}") as MarketingAttribution;
  } catch {
    return {};
  }
}

export function captureMarketingAttribution(): MarketingAttribution {
  if (typeof window === "undefined") return {};

  const url = new URL(window.location.href);
  const current: MarketingAttribution = readStored();

  for (const key of KEYS) {
    const value = url.searchParams.get(key);
    if (value) current[key] = value;
  }

  if (!current.landing_page) current.landing_page = url.pathname;
  if (!current.referrer && document.referrer) current.referrer = document.referrer;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    // Storage can be unavailable in privacy-restricted browsers.
  }

  return current;
}

export function getMarketingAttribution(): MarketingAttribution {
  return captureMarketingAttribution();
}
