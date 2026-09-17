import { useState } from "react";
import { Clock, MapPin, Phone, Star } from "lucide-react";
import { business } from "@/content/business";
import { trackEvent } from "@/lib/analytics";

/** Bloc SEO local : téléphone cliquable, horaires, zone d'intervention, fiche Google. */
export function LocalInfo({ area }: { area?: string }) {
  const zone = area ?? `${business.city}, Seine-Saint-Denis, Paris et Île-de-France`;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <a
        href={business.phoneHref}
        onClick={() => trackEvent("appel_telephone", { source: "bloc_local" })}
        className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent"
      >
        <Phone className="mt-0.5 size-5 shrink-0 text-accent" />
        <span>
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Téléphone
          </span>
          <span className="font-display text-base font-bold">{business.phone}</span>
        </span>
      </a>


      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
        <Clock className="mt-0.5 size-5 shrink-0 text-accent" />
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Horaires
          </span>
          <span className="text-sm font-medium">{business.hours}</span>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
        <MapPin className="mt-0.5 size-5 shrink-0 text-accent" />
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Zone d'intervention
          </span>
          <span className="text-sm font-medium">{zone}</span>
        </div>
      </div>

      <a
        href={business.googleBusinessUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("clic_fiche_google", { source: "bloc_local" })}
        className="flex items-start gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-accent"
      >
        <Star className="mt-0.5 size-5 shrink-0 text-accent" />
        <span>
          <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Fiche Google
          </span>
          <span className="text-sm font-medium">
            Voir nos avis et notre fiche {business.name} sur Google
          </span>
        </span>
      </a>
    </div>
  );
}

/**
 * Carte Google Maps chargée uniquement au clic du visiteur.
 * L'iframe n'est jamais demandée aux robots : aucune ressource Google bloquée
 * lors de l'exploration de la page.
 */
export function LocalMap({ query, title }: { query: string; title: string }) {
  const [loaded, setLoaded] = useState(false);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      {loaded ? (
        <iframe
          title={title}
          src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&hl=fr&z=13&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-72 w-full border-0 sm:h-80"
        />
      ) : (
        <div className="flex h-72 w-full flex-col items-center justify-center gap-4 bg-secondary/60 p-6 text-center sm:h-80">
          <MapPin className="size-8 text-accent" />
          <p className="max-w-sm text-sm text-muted-foreground">{title}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setLoaded(true)}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Afficher la carte
            </button>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent"
            >
              Ouvrir dans Google Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
