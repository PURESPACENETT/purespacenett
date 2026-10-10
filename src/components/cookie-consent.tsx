import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "psn-analytics-consent";
const ADS_STORAGE_KEY = "psn-advertising-consent";

export function getAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "accepted";
}

export function getAdvertisingConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADS_STORAGE_KEY) === "accepted";
}

export const reopenCookieConsent = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.localStorage.removeItem(ADS_STORAGE_KEY);
  window.dispatchEvent(new Event("psn-consent-change"));
};

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!window.localStorage.getItem(ADS_STORAGE_KEY));
    // Rouvre le bandeau quand « Gérer mes cookies » efface les choix enregistrés.
    const reopen = () => setVisible(!window.localStorage.getItem(ADS_STORAGE_KEY));
    window.addEventListener("psn-consent-change", reopen);
    return () => window.removeEventListener("psn-consent-change", reopen);
  }, []);

  const choose = (analytics: boolean, advertising: boolean) => {
    window.localStorage.setItem(STORAGE_KEY, analytics ? "accepted" : "refused");
    window.localStorage.setItem(ADS_STORAGE_KEY, advertising ? "accepted" : "refused");
    setVisible(false);
    window.dispatchEvent(new Event("psn-consent-change"));
  };

  if (!visible) return null;

  return (
    <aside
      aria-label="Préférences de confidentialité"
      className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-border bg-card p-5 shadow-2xl sm:inset-x-auto sm:right-5 sm:max-w-xl"
    >
      <p className="font-display text-base font-bold">Votre confidentialité</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Les traceurs nécessaires assurent le fonctionnement du site. Vous pouvez autoriser Google
        Analytics à mesurer l'audience, ou Google Ads à mesurer les demandes issues des annonces.
        Chaque choix est facultatif et peut être modifié à tout moment.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => choose(false, false)}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
        >
          Tout refuser
        </button>
        <button
          type="button"
          onClick={() => choose(true, false)}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Accepter l'analyse d'audience
        </button>
        <button
          type="button"
          onClick={() => choose(getAnalyticsConsent(), true)}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Autoriser la mesure Google Ads
        </button>
        <Link to="/politique-confidentialite" className="px-2 py-2 text-sm underline">
          En savoir plus
        </Link>
      </div>
    </aside>
  );
}

