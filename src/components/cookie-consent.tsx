import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "psn-analytics-consent";

export function getAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "accepted";
}

export const reopenCookieConsent = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("psn-consent-change"));
};

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!window.localStorage.getItem(STORAGE_KEY));
    // rouvre le bandeau quand « Gérer mes cookies » efface le choix enregistré
    const reopen = () => setVisible(!window.localStorage.getItem(STORAGE_KEY));
    window.addEventListener("psn-consent-change", reopen);
    return () => window.removeEventListener("psn-consent-change", reopen);
  }, []);

  const choose = (accepted: boolean) => {
    window.localStorage.setItem(STORAGE_KEY, accepted ? "accepted" : "refused");
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
        Nous utilisons uniquement des cookies ou traceurs nécessaires au fonctionnement du site.
        Avec votre accord, Google Analytics mesure l'audience afin de nous aider à améliorer le site.
        Vous pouvez refuser sans perdre l'accès au site.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => choose(false)}
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold"
        >
          Refuser
        </button>
        <button
          type="button"
          onClick={() => choose(true)}
          className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Accepter l'analyse d'audience
        </button>
        <Link to="/politique-confidentialite" className="px-2 py-2 text-sm underline">
          En savoir plus
        </Link>
      </div>
    </aside>
  );
}
