import { Clock, MapPin, Phone } from "lucide-react";
import { business } from "@/content/business";

/** Bloc SEO local : téléphone cliquable, horaires, zone d'intervention. */
export function LocalInfo({ area }: { area?: string }) {
  const zone = area ?? `${business.city}, Seine-Saint-Denis, Paris et Île-de-France`;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <a
        href={business.phoneHref}
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
    </div>
  );
}

/** Carte Google Maps, chargée seulement à l'approche du bloc. */
export function LocalMap({ query, title }: { query: string; title: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <iframe
        title={title}
        src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&hl=fr&z=13&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-72 w-full border-0 sm:h-80"
      />
    </div>
  );
}
